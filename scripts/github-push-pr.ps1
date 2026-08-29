param(
  [ValidateSet("ExistingBranch", "NewBranch", "PullRequest")]
  [string]$Mode = "ExistingBranch",
  [string]$RemoteName = "crested",
  [string]$Repo = "Crested-Labs/CrestedApp",
  [string]$BaseBranch = "",
  [string]$BranchName = "",
  [string]$BranchPrefix = "codex/work",
  [string]$CommitMessage = "",
  [switch]$Draft,
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"

function Invoke-Checked {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Invoke-CaptureChecked {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  $output = & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }

  return $output
}

function Assert-CommandExists {
  param([string]$Command)

  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    throw "Required command '$Command' was not found."
  }
}

function New-Slug {
  param([string]$Source)

  $slug = $Source.ToLowerInvariant()
  $slug = $slug -replace '[^a-z0-9._-]+', '-'
  $slug = $slug.Trim('-')

  if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "update"
  }

  if ($slug.Length -gt 36) {
    $slug = $slug.Substring(0, 36).Trim('-')
  }

  return $slug
}

function Get-CurrentBranch {
  $currentBranch = (Invoke-CaptureChecked "git" @("branch", "--show-current") | Select-Object -First 1).Trim()
  if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    throw "Detached HEAD is not supported. Check out a branch first."
  }

  return $currentBranch
}

function Test-LocalBranch {
  param([string]$Name)

  & git show-ref --verify --quiet "refs/heads/$Name"
  return $LASTEXITCODE -eq 0
}

function Test-RemoteBranch {
  param([string]$Name)

  & git ls-remote --exit-code --heads $RemoteName $Name | Out-Null
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0) {
    return $true
  }

  if ($exitCode -eq 2) {
    return $false
  }

  throw "Could not check remote branch '$Name'. git ls-remote exited with $exitCode."
}

function Assert-CleanBeforeSwitch {
  param([string]$Target)

  $status = Invoke-CaptureChecked "git" @("status", "--porcelain")
  if ($status) {
    throw "Cannot switch to '$Target' because the working tree has uncommitted changes. Commit/stash them or run this from the target branch."
  }
}

function Switch-ToExistingBranch {
  param([string]$Name)

  $currentBranch = Get-CurrentBranch
  if ($currentBranch -eq $Name) {
    return
  }

  Assert-CleanBeforeSwitch $Name

  if (Test-LocalBranch $Name) {
    Invoke-Checked "git" @("switch", $Name)
    return
  }

  if (Test-RemoteBranch $Name) {
    Invoke-Checked "git" @("fetch", $RemoteName, $Name)
    Invoke-Checked "git" @("switch", "--track", "-c", $Name, "$RemoteName/$Name")
    return
  }

  throw "Branch '$Name' does not exist locally or on remote '$RemoteName'."
}

function Resolve-CommitMessage {
  param([string]$GivenMessage)

  if (-not [string]::IsNullOrWhiteSpace($GivenMessage)) {
    return $GivenMessage
  }

  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  return "chore: update local workspace $timestamp"
}

function Invoke-Checks {
  if ($SkipChecks -or -not (Test-Path "package.json")) {
    return
  }

  $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
  if ($packageJson.scripts.PSObject.Properties.Name -contains "typecheck") {
    if (Get-Command "npm" -ErrorAction SilentlyContinue) {
      Invoke-Checked "npm" @("run", "typecheck")
    } else {
      Write-Warning "npm was not found in PATH. Skipping typecheck."
    }
  }
}

function Commit-LocalChanges {
  param([string]$Message)

  $status = Invoke-CaptureChecked "git" @("status", "--porcelain")
  if (-not $status) {
    Write-Host "No changes to commit."
    return $false
  }

  Invoke-Checked "git" @("add", "-A")

  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    Write-Host "No staged changes to commit."
    return $false
  }
  if ($LASTEXITCODE -ne 1) {
    throw "git diff --cached --quiet failed with exit code $LASTEXITCODE"
  }

  Invoke-Checked "git" @("commit", "-m", $Message)
  return $true
}

function Push-CurrentHead {
  param([string]$Name)

  Invoke-Checked "git" @("push", "-u", $RemoteName, "HEAD:$Name")
}

function Get-OpenPullRequestUrl {
  param(
    [string]$HeadBranch,
    [string]$Base
  )

  $url = Invoke-CaptureChecked "gh" @(
    "pr", "list",
    "--repo", $Repo,
    "--head", $HeadBranch,
    "--base", $Base,
    "--state", "open",
    "--json", "url",
    "--jq", ".[0].url"
  )

  return ($url | Select-Object -First 1)
}

function Ensure-PullRequest {
  param(
    [string]$HeadBranch,
    [string]$Base,
    [string]$Title
  )

  $existingUrl = Get-OpenPullRequestUrl $HeadBranch $Base
  if (-not [string]::IsNullOrWhiteSpace($existingUrl)) {
    Write-Host "Updated existing pull request:"
    Write-Host $existingUrl
    return
  }

  $prBody = @"
Automated pull request created from the local workspace.

Script: scripts/github-push-pr.ps1
"@

  $prArgs = @(
    "pr", "create",
    "--repo", $Repo,
    "--base", $Base,
    "--head", $HeadBranch,
    "--title", $Title,
    "--body", $prBody
  )

  if ($Draft) {
    $prArgs += "--draft"
  }

  Invoke-Checked "gh" $prArgs
}

Assert-CommandExists "git"
Assert-CommandExists "gh"

$repoRoot = (Invoke-CaptureChecked "git" @("rev-parse", "--show-toplevel") | Select-Object -First 1).Trim()
Set-Location $repoRoot

$trackedEnvFiles = Invoke-CaptureChecked "git" @("ls-files", "--", ".env", ".env.*") |
  Where-Object { $_ -and $_ -notmatch '(^|/)\.env\.example$' }

if ($trackedEnvFiles) {
  throw "Refusing to continue because local environment files are tracked: $($trackedEnvFiles -join ', ')"
}

$remoteNames = Invoke-CaptureChecked "git" @("remote")
if ($remoteNames -notcontains $RemoteName) {
  Invoke-Checked "git" @("remote", "add", $RemoteName, "https://github.com/$Repo.git")
}

$remoteUrl = (Invoke-CaptureChecked "git" @("remote", "get-url", $RemoteName) | Select-Object -First 1).Trim()
if ($remoteUrl -notmatch [regex]::Escape($Repo)) {
  Write-Host "Warning: remote '$RemoteName' currently points to '$remoteUrl'."
}

Invoke-Checked "gh" @("auth", "status", "--hostname", "github.com")

$repoInfoJson = Invoke-CaptureChecked "gh" @("repo", "view", $Repo, "--json", "viewerPermission,defaultBranchRef")
$repoInfo = ($repoInfoJson -join "`n") | ConvertFrom-Json
$allowedPermissions = @("ADMIN", "MAINTAIN", "WRITE")

if ($allowedPermissions -notcontains $repoInfo.viewerPermission) {
  throw "GitHub account does not have write permission for $Repo. Current permission: $($repoInfo.viewerPermission)"
}

if ([string]::IsNullOrWhiteSpace($BaseBranch)) {
  $BaseBranch = $repoInfo.defaultBranchRef.name
}

if ([string]::IsNullOrWhiteSpace($BaseBranch)) {
  throw "Could not determine a base branch. Pass -BaseBranch explicitly."
}

Invoke-Checks

$message = Resolve-CommitMessage $CommitMessage
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

switch ($Mode) {
  "ExistingBranch" {
    if ([string]::IsNullOrWhiteSpace($BranchName)) {
      $BranchName = Get-CurrentBranch
    } else {
      Switch-ToExistingBranch $BranchName
    }

    Commit-LocalChanges $message | Out-Null
    Push-CurrentHead $BranchName
    Write-Host "Pushed to existing branch '$BranchName'."
  }

  "NewBranch" {
    if ([string]::IsNullOrWhiteSpace($BranchName)) {
      $slug = New-Slug $message
      $BranchName = "$BranchPrefix-$timestamp-$slug"
    }

    if ((Test-LocalBranch $BranchName) -or (Test-RemoteBranch $BranchName)) {
      throw "Branch '$BranchName' already exists. Choose another name for NewBranch mode."
    }

    Invoke-Checked "git" @("switch", "-c", $BranchName)
    Commit-LocalChanges $message | Out-Null
    Push-CurrentHead $BranchName
    Write-Host "Pushed to new branch '$BranchName'."
  }

  "PullRequest" {
    if ([string]::IsNullOrWhiteSpace($BranchName)) {
      $BranchName = Get-CurrentBranch
    } else {
      Switch-ToExistingBranch $BranchName
    }

    if ($BranchName -eq $BaseBranch) {
      throw "PullRequest mode needs an existing head branch different from base branch '$BaseBranch'. Pass -BranchName or switch to a PR branch first."
    }

    Commit-LocalChanges $message | Out-Null
    Push-CurrentHead $BranchName
    Ensure-PullRequest $BranchName $BaseBranch $message
  }
}
