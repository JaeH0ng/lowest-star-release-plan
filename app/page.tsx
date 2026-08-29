'use client';

import { useEffect, useState } from 'react';

type Lang = 'ko' | 'en';
type L = { ko: string; en: string };

const t = (ko: string, en: string): L => ({ ko, en });

const budgetGroups = [
  {
    key: 'audio', number: '01', title: t('음원 제작', 'Recording'), total: 500000,
    rows: [
      [t('녹음 프로덕션', 'Studio recording'), 200000],
      [t('믹스 · 마스터', 'Mixing and mastering'), 300000],
    ] as [L, number][],
  },
  {
    key: 'art', number: '02', title: t('그림 · 스톱모션', 'Art and stop motion'), total: 520000,
    rows: [
      [t('기획 · 미술 2명 × 15만 원', 'Art direction, 2 people at 150,000'), 300000],
      [t('스톱모션 · 소품 · 미술 재료', 'Stop motion, props and art materials'), 180000],
      [t('조명 · 촬영 세팅', 'Lighting and rig'), 40000],
    ] as [L, number][],
  },
  {
    key: 'video', number: '03', title: t('영상 · 촬영', 'Live action'), total: 280000,
    rows: [
      [t('동해 촬영 참여 1일', 'East Sea shoot, one day'), 100000],
      [t('동해 이동 · 유류 · 통행 · 주차', 'Travel, fuel, tolls and parking'), 80000],
      [t('촬영 · 작업일 식사 · 간식', 'Meals on shoot and work days'), 70000],
      [t('저장 · 백업 매체', 'Storage and backup media'), 20000],
      [t('예비비', 'Contingency'), 10000],
    ] as [L, number][],
  },
] as const;

const formatWon = (value: number, lang: Lang) =>
  lang === 'ko'
    ? `${(value / 10000).toLocaleString('ko-KR')}만 원`
    : `₩${value.toLocaleString('en-US')}`;

type CalendarEvent = { title: L; kind: 'audio' | 'video' | 'release' | 'decision' };

const calendarMonths = [
  {
    name: 'SEPTEMBER', month: 9, label: t('9월', 'Sep'), start: 2, days: 30,
    events: {
      2: [{ title: t('제작팀 킥오프', 'Team kickoff'), kind: 'decision' }],
      4: [{ title: t('유통사 3곳 문의', 'Contact 3 distributors'), kind: 'release' }],
      9: [{ title: t('발매일 · 곡 길이 잠금', 'Lock date and length'), kind: 'decision' }],
      13: [{ title: t('가녹음 · 가믹스', 'Scratch take'), kind: 'audio' }],
      16: [{ title: t('스톱모션 기획안 확정', 'Stop motion plan due'), kind: 'video' }],
      18: [{ title: t('콘티 · 로케이션 확정', 'Boards and location'), kind: 'video' }],
      20: [{ title: t('세트 · 조명 세팅 완료', 'Set and lighting ready'), kind: 'video' }],
      21: [{ title: t('스톱모션 본제작 시작', 'Stop motion begins'), kind: 'video' }],
      22: [{ title: t('동해 촬영 창 시작', 'Shoot window opens'), kind: 'decision' }],
      30: [{ title: t('본녹음 완료', 'Final take done'), kind: 'audio' }],
    } as Record<number, CalendarEvent[]>,
  },
  {
    name: 'OCTOBER', month: 10, label: t('10월', 'Oct'), start: 4, days: 31,
    events: {
      6: [{ title: t('기상 예비일 · 동해 촬영 종료', 'Weather backup, window closes'), kind: 'video' }],
      8: [{ title: t('마스터 · 유통자료 제출', 'Master and assets due'), kind: 'decision' }],
      17: [{ title: t('스톱모션 본제작 완료', 'Stop motion complete'), kind: 'video' }],
      18: [{ title: t('러프컷 V1', 'Rough cut V1'), kind: 'video' }],
      25: [{ title: t('피드백 V2', 'Feedback V2'), kind: 'video' }],
      30: [{ title: t('플랫폼 피칭 · 홍보', 'Pitching and promo'), kind: 'release' }],
    } as Record<number, CalendarEvent[]>,
  },
  {
    name: 'NOVEMBER', month: 11, label: t('11월', 'Nov'), start: 0, days: 30,
    events: {
      1: [{ title: t('픽처락 · 색보정', 'Picture lock and grade'), kind: 'video' }],
      6: [{ title: t('뮤직비디오 최종본', 'Final music video'), kind: 'decision' }],
      7: [{ title: t('업로드 · 티저 시작', 'Upload and teaser'), kind: 'release' }],
      13: [{ title: t('음원 · MV 공개', 'Single and MV out'), kind: 'release' }],
    } as Record<number, CalendarEvent[]>,
  },
] as const;

const weekdays: Record<Lang, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
};

const snapshot = [
  { n: '01', d: '09.02', label: t('제작팀 킥오프 회의', 'Team kickoff meeting') },
  { n: '02', d: '09.09', label: t('유통사 · 발매일 · 곡 길이 잠금', 'Distributor, date and length locked') },
  { n: '03', d: '09.16', label: t('스톱모션 기획안 확정', 'Stop motion plan confirmed') },
  { n: '04', d: '10.08', label: t('마스터 및 유통자료 제출', 'Master and assets delivered') },
  { n: '05', d: '11.06', label: t('뮤직비디오 최종본 완성', 'Final music video locked') },
] as const;

const rightsColumns = [
  {
    key: 'A', title: t('각자가 갖는 권리', 'What each of you keeps'),
    items: [
      [t('작업물의 저작권을 그대로 보유', 'You keep the copyright in your work'),
        t('제작자에게 넘기지 않는다. 제작자는 뮤직비디오에 사용할 권리만 갖는다',
          'It is not transferred. The producer only receives the right to use it in this music video')],
      [t('포트폴리오 · 전시 · 공모전 자유 사용', 'Free use for portfolio, exhibition and open calls'),
        t('별도 동의 절차 없이 자신의 작업을 발표할 수 있다',
          'You may present your own work without asking for further permission')],
      [t('세트 · 소품 실물', 'The physical sets and props'),
        t('촬영 후 폐기하지 않고 참여자가 전시 등에 활용할 수 있게 보관한다',
          'Nothing is discarded after the shoot. It is kept so that you can exhibit it')],
      [t('독립 상영본과 원본 파일', 'A standalone cut and the source files'),
        t('자기 파트만 분리한 영상과 촬영 원본을 전달받는다',
          'You receive a cut containing only your part, plus the original footage')],
    ] as [L, L][],
  },
  {
    key: 'B', title: t('제작자가 준비하는 자료', 'What the producer prepares'),
    items: [
      [t('참여 계약서', 'Participation agreement'),
        t('09.02 작성. 역할 · 기간 · 보수 · 권리를 명시하고 양측 날인',
          'Signed on 09.02, stating role, term, fee and rights, sealed by both sides')],
      [t('작품 사진과 제작 과정 기록', 'Documentation photographs'),
        t('세트 완성 시점에 고화질로 촬영. 나중에 다시 만들 수 없다',
          'Shot in high resolution once the set is built. This cannot be recreated later')],
      [t('참여확인서', 'Certificate of participation'),
        t('공개 후 1개월 이내 발행. 작품명 · 공개일 · 역할 · 기여 분량 · 보수 기재',
          'Issued within a month of release, stating title, date, role, contribution and fee')],
      [t('작품 아카이브 페이지', 'Work archive page'),
        t('공개일자와 전체 크레딧이 남는 인용 가능한 URL',
          'A citable URL holding the release date and the full credits')],
    ] as [L, L][],
  },
] as const;

const roadmap = [
  {
    from: '08.29', to: '— 09.02', num: '01',
    a: [t('준비와 킥오프', 'Preparation and kickoff'), t('가사 · 데모 · 레퍼런스 · 예산표 준비', 'Lyrics, demo, references and budget')] as [L, L],
    v: [t('제작팀 첫 회의', 'First team meeting'), t('권리와 크레딧, 예산, 콘셉트, 역할, 촬영 후보일 결정', 'Rights and credits, budget, concept, roles and candidate shoot dates')] as [L, L],
  },
  {
    from: '09.03', to: '— 09.09', num: '02',
    a: [t('곡 구조 잠금', 'Song structure locked'), t('BPM · 구성 · 전체 길이 확정, 촬영용 플레이백 제작', 'Tempo, form and length fixed. Playback prepared')] as [L, L],
    v: [t('기획 잠금', 'Concept locked'), t('한 문장 메시지, 필수 장면, 스톱모션 분량과 기법 방향', 'One sentence message, essential scenes, stop motion scope')] as [L, L],
  },
  {
    from: '09.10', to: '— 09.16', num: '03',
    a: [t('가녹음', 'Scratch take'), t('가녹음 · 가믹스로 편집용 플레이백 확보', 'Scratch recording and mix for editing playback')] as [L, L],
    v: [t('스톱모션 기획안 확정', 'Stop motion plan confirmed'), t('기법 · 분량 · 프레임레이트 · 작업 공간 · 재료 목록 결정', 'Technique, length, frame rate, workspace and material list')] as [L, L],
  },
  {
    from: '09.17', to: '— 09.20', num: '04',
    a: [t('본녹음', 'Final recording'), t('보컬 · 악기 녹음과 편집', 'Vocals and instruments recorded and edited')] as [L, L],
    v: [t('세트 제작 · 조명 세팅', 'Set building and lighting'), t('재료 구입, 미니어처 제작, 카메라 고정과 수동 노출 고정', 'Materials bought, miniatures built, camera and exposure locked')] as [L, L],
  },
  {
    from: '09.21', to: '— 10.17', num: '05',
    a: [t('믹스 · 마스터', 'Mixing and mastering'), t('10.08 커버 · 소개글 · 크레디트와 함께 유통자료 제출', 'Artwork, notes and credits delivered by 10.08')] as [L, L],
    v: [t('스톱모션 본제작 (최장 구간)', 'Stop motion production (longest phase)'), t('프레임 촬영 · 드로잉 애니메이션. 동해 촬영 무박 1일을 이 기간에 끼워 넣는다', 'Frame by frame shooting and drawn animation. The one day East Sea shoot sits inside this window')] as [L, L],
  },
  {
    from: '10.18', to: '— 11.06', num: '06',
    a: [t('발매 사전 세팅', 'Release setup'), t('플랫폼 등록 확인, 소개문, 피칭, 티저 준비', 'Platform registration, notes, pitching and teaser')] as [L, L],
    v: [t('후반작업', 'Post production'), t('러프컷 V1 → 피드백 V2 → 픽처락 → 색보정 · 독립 상영본 추출', 'Rough cut V1, feedback V2, picture lock, grade and standalone cut export')] as [L, L],
  },
  {
    from: '11.07', to: '— 11.13', num: '07', final: true,
    a: [t('공개 준비', 'Release preparation'), t('프리세이브 · 채널 정리 · 링크와 게시물 예약', 'Pre-save, channels, links and scheduled posts')] as [L, L],
    v: [t('동시 공개', 'Simultaneous release'), t('11월 13일 음원과 뮤직비디오 공개 · 크레딧과 참여확인서 발행', 'Single and music video released on 13 November. Credits and certificates issued')] as [L, L],
  },
] as const;

const meetingColumns = [
  {
    key: 'A',
    title: t('정하고 가는 것', 'Decided in advance'),
    sub: t('받아들일 수 있는지 확인', 'We only confirm you can accept it'),
    items: [
      [t('총예산 130만 원 고정', 'Total budget fixed at 1,300,000'), t('늘릴 수 없다. 필요하면 범위를 줄인다', 'It cannot grow. If needed we reduce the scope')],
      [t('사례비', 'Fees'), t('기획 · 미술 각 15만 원, 동해 촬영 10만 원', '150,000 each for art, 100,000 for the shoot')],
      [t('재료비 18만 원', 'Materials 180,000'), t('제작자가 선지급하며 참여자 지출이 없게 한다', 'Paid in advance so that you never spend your own money')],
      [t('음원 50만 원은 타협하지 않는다', 'The 500,000 for audio is not negotiable'), t('곡이 본체이고 뮤비는 곡을 알리는 수단이다', 'The song is the work. The video carries it')],
      [t('동해 촬영은 1일', 'One day at the East Sea'), t('2일은 감당이 어렵다. 필요하면 찍을 것을 줄인다', 'Two days is beyond reach. We shoot less instead')],
      [t('식대 기준', 'Meals'), t('촬영일 · 작업일은 제작자, 회의 술자리는 각자', 'The producer covers shoot and work days. Social nights are your own')],
      [t('저작권은 각자 보유', 'Copyright stays with the maker'), t('제작자는 뮤직비디오 사용권만 갖는다', 'The producer only takes the right to use it in the video')],
    ] as [L, L][],
  },
  {
    key: 'B',
    title: t('반드시 결정', 'Must be decided'),
    sub: t('없으면 다음이 막힌다', 'Nothing moves until these are set'),
    items: [
      [t('크레딧 이름과 역할명', 'Credit names and roles'), t('각자 다른 직종으로. 모호한 표기와 공동 표기는 쓰지 않는다', 'A distinct job title each. No vague or merged credits')],
      [t('계약서 작성과 날인', 'Signing the agreement'), t('성명 · 생년월일 · 계좌. 나중에 하려면 다시 모여야 한다', 'Name, date of birth, account. Otherwise we meet again only for this')],
      [t('동해 촬영일과 예비일', 'Shoot date and backup'), t('가장 먼저 잠가야 하는 날짜. 회신 마감 09.09', 'The first date that must be locked. Reply by 09.09')],
      [t('동해 현장 인원과 차량', 'Crew size and vehicles'), t('여기서 식비와 이동비가 확정된다', 'This fixes the meal and travel budget')],
      [t('편집 담당', 'Who edits'), t('사례비와 총예산은 어느 경우에도 변하지 않는다', 'Fees and the total budget stay the same either way')],
      [t('스톱모션 인계 형태', 'Stop motion handover format'), t('완성 시퀀스인가 프레임 소스인가. 편집 부담을 결정한다', 'Finished sequences or raw frames. This decides the editing load')],
      [t('스톱모션 기획안 마감일', 'Stop motion plan deadline'), t('09.16 목표. 늦으면 재료 · 착수 · 러프컷이 밀린다', 'Target 09.16. Any delay pushes materials, start and rough cut')],
    ] as [L, L][],
  },
  {
    key: 'C',
    title: t('방향만 잡는 것', 'Direction only'),
    sub: t('오늘 확정하지 않는다', 'Not finalised today'),
    items: [
      [t('콘셉트와 감정선', 'Concept and emotional arc'), t('이 곡이 어떤 감정으로 끝나야 하는가', 'What feeling should the song end on')],
      [t('4분을 어떻게 채우는가', 'How to fill four minutes'), t('실사 30초 + 스톱모션. 노동량이 적은 기법도 섞는다', 'Thirty seconds of live action plus stop motion, mixed with lighter techniques')],
      [t('동해 필수 컷', 'Essential East Sea shots'), t('없으면 성립 안 되는 컷인가, 있으면 좋은 컷인가', 'Does the film fail without them, or are they a bonus')],
      [t('비가 왔을 때', 'If it rains'), t('대안 로케이션 · 예비일 재시도 · 후일 단독 촬영 중 택1', 'Alternate location, backup day, or a later solo shoot')],
      [t('스톱모션 작업 공간', 'Stop motion workspace'), t('몇 주간 세팅을 고정해 둘 자리가 필요하다', 'A corner that can stay untouched for weeks')],
    ] as [L, L][],
  },
] as const;

const c = {
  navBudget: t('예산', 'Budget'),
  navRights: t('권리', 'Rights'),
  navRoadmap: t('로드맵', 'Roadmap'),
  navCalendar: t('캘린더', 'Calendar'),
  navMeeting: t('회의', 'Meeting'),
  heroTitle: t('가장 낮은 별', 'The Lowest Star'),
  heroTitleEm: t('발매 프로젝트', 'Release Project'),
  heroCopy: t(
    '작사·작곡을 마친 한 곡을 음원과 뮤직비디오로 완성해 세상에 내놓기 위한 11주 실행 일정과 제작 계획. 뮤직비디오는 손으로 만드는 스톱모션 애니메이션과 동해 로케이션 촬영으로 구성한다.',
    'An eleven week plan to take one finished song and release it as a single with a music video. The video is built from handmade stop motion animation and a single day of location shooting on the East Sea coast.',
  ),
  releaseSub: t('FRIDAY · 일정 확정 마감 09.09', 'FRIDAY · schedule locked by 09.09'),
  dlTotal: t('총예산', 'Total'),
  dlAudio: t('음원', 'Audio'),
  dlVideo: t('뮤직비디오', 'Video'),
  budgetHeading: t('총예산 130만 원', 'Total budget 1,300,000 KRW'),
  budgetSummary: t('음원 50 · 그림 52 · 영상 28', 'Audio 50 · Art 52 · Live action 28 (in 10,000 KRW)'),
  colItem: t('항목', 'Item'),
  colAmount: t('금액', 'Amount'),
  budgetNote: t(
    '* 사례비는 기획 · 미술 2명 각 15만 원, 동해 촬영 10만 원입니다. 재료 · 조명 · 교통 · 식사는 사례비와 분리해 전액 제작자가 부담하며, 참여자가 비용을 먼저 지출하지 않도록 선지급합니다. 재료비는 콘셉트 확정 후와 중간 점검 후 두 차례로 나누어 지급하고, 영수증 제출 의무는 없으며 남은 금액은 참여자에게 귀속됩니다. 동해 촬영은 무박 1일 기준입니다.',
    '* Fees are 150,000 KRW for each of the two art leads and 100,000 KRW for the one day shoot. Materials, lighting, travel and meals sit outside the fees and are fully covered by the producer, paid in advance so that no participant spends their own money first. The materials budget is released in two parts, after the concept is fixed and after the mid point check. No receipts are required and any remainder belongs to the participant. The East Sea shoot is a single day with no overnight stay.',
  ),
  rightsHeading: t('참여자가 갖는 것', 'What participants keep'),
  rightsSummary: t('저작권은 만든 사람에게', 'Copyright belongs to the maker'),
  rightsNote: t(
    '* 크레딧은 영상 엔딩 · 공개 채널 설명란 · 음원 앨범 소개 · 작품 아카이브 페이지 네 곳 모두에 표기하며, 역할명은 각자가 직접 정합니다. 사례비는 계좌이체로 지급하여 예술활동 수입 증빙이 남도록 합니다.',
    '* Credits appear in all four places: the end titles, the video description, the album notes and the archive page. Each person decides how their own role is worded. Fees are paid by bank transfer so that a record of artistic income remains.',
  ),
  rightsNote2: t(
    '* 킥오프에는 권리 안내문 · 제작 개요 · 발매 계획 · 참여 계약서를 역할별로 인쇄해 나눕니다. 계약서는 그 자리에서 작성하고 양측이 날인하여 각 1부씩 보관합니다.',
    '* At the kickoff each role receives a printed pack: the rights guide, the production overview, the release plan and the agreement. The agreement is completed and sealed on the spot, one copy for each side.',
  ),
  roadmapHeading: t('두 트랙, 하나의 발매일', 'Two tracks, one release date'),
  roadmapLead: t(
    '음원과 영상은 따로 달리지만, 9월 9일 곡 길이 잠금과 10월 8일 마스터 제출에서 반드시 만난다. 전체 일정의 병목은 촬영이 아니라 약 4주가 걸리는 스톱모션 본제작이다.',
    'Audio and video run separately but must meet twice: when the song length is locked on 9 September and when the master is delivered on 8 October. The bottleneck is not the shoot but the four weeks of stop motion production.',
  ),
  trackAudio: t('음원 제작', 'Audio'),
  trackVideo: t('뮤직비디오 제작', 'Music video'),
  legendAudio: t('음원', 'Audio'),
  legendVideo: t('영상', 'Video'),
  legendDecision: t('결정', 'Decision'),
  legendRelease: t('유통 · 공개', 'Release'),
  calNote: t(
    '* 이 일정의 병목은 촬영이 아니라 9월 21일부터 10월 17일까지 약 4주간 이어지는 스톱모션 본제작이다. 동해 촬영은 그 기간 안에 무박 1일로 넣는다. 촬영일 1 · 2순위와 기상 예비일은 9월 2일 회의에서 확정하며, 9월 24–27일과 10월 3–5일 공식 연휴는 촬영 창에서 제외했다.',
    '* The bottleneck is not the shoot but the four weeks of stop motion production from 21 September to 17 October. The single day East Sea shoot sits inside that window. First and second choice dates and a weather backup are fixed at the meeting on 2 September. The public holidays of 24 to 27 September and 3 to 5 October are excluded.',
  ),
  meetHeading: t('수요일 회의에서 의논할 것', 'What we settle on Wednesday'),
  meetLead: t(
    '완성된 콘티를 가져가는 자리가 아니라, 각자가 무엇을 갖고 무엇을 언제까지 할지 결정하는 자리다. 받아들이기 어려운 것이 있으면 그날 말하는 편이 서로에게 낫다.',
    'This is not a meeting to hand over finished storyboards. It decides what each person keeps and what each person does by when. If something is hard to accept, saying so on the day is better for everyone.',
  ),
  footerDate: t('2026.08.29 기준', 'As of 2026.08.29'),
  footerNote: t(
    '발매일과 촬영 후보일은 제작팀 및 유통사 협의 전 가안입니다.',
    'The release date and candidate shoot dates are provisional, pending agreement with the team and the distributor.',
  ),
  toggleLabel: t('EN', '한국어'),
  toggleAria: t('Switch to English', 'Switch to Korean'),
  navAria: t('페이지 탐색', 'Page navigation'),
  releaseAria: t('발매 목표 요약', 'Release summary'),
  snapshotAria: t('핵심 마일스톤', 'Key milestones'),
};

function CalendarMonth({ data, lang }: { data: (typeof calendarMonths)[number]; lang: Lang }) {
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - data.start + 1;
    return day > 0 && day <= data.days ? day : null;
  });

  return (
    <article className="month-card">
      <header><span>2026</span><h3>{data.label[lang]}</h3><b>{data.name}</b></header>
      <div className="weekday-row">
        {weekdays[lang].map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          const events = day ? data.events[day] : undefined;
          return (
            <div key={`${data.month}-${index}`} className={`day-cell${events ? ' has-event' : ''}${data.month === 11 && day === 13 ? ' release-day' : ''}`}>
              {day && <span className="day-number">{day}</span>}
              {events?.map((event) => (
                <small key={event.title.ko} className={`event-${event.kind}`}>{event.title[lang]}</small>
              ))}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery === 'en' || fromQuery === 'ko') return fromQuery;
  try {
    const stored = window.localStorage.getItem('lowstar-lang');
    if (stored === 'en' || stored === 'ko') return stored;
  } catch {
    // 저장소 접근이 막힌 브라우저에서는 기본값을 쓴다
  }
  return 'ko';
}

export default function Home() {
  const [lang, setLang] = useState<Lang>(readInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem('lowstar-lang', lang);
    } catch {
      // 저장이 막힌 브라우저에서도 화면은 정상 동작한다
    }
  }, [lang]);

  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label={c.navAria[lang]}>
          <a className="brand" href="#top"><span>LOW STAR</span><small>release plan</small></a>
          <div className="navlinks">
            <a href="#budget">{c.navBudget[lang]}</a>
            <a href="#rights">{c.navRights[lang]}</a>
            <a href="#roadmap">{c.navRoadmap[lang]}</a>
            <a href="#calendar">{c.navCalendar[lang]}</a>
            <a href="#meeting">{c.navMeeting[lang]}</a>
            <button
              type="button"
              className="lang-toggle"
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              aria-label={c.toggleAria[lang]}
            >
              {c.toggleLabel[lang]}
            </button>
          </div>
        </nav>

        <div className="hero-grid">
          <section>
            <p className="eyebrow">SINGLE &amp; MUSIC VIDEO · WORKING PLAN</p>
            <h1>{c.heroTitle[lang]}<br /><em>{c.heroTitleEm[lang]}</em></h1>
            <p className="hero-copy">{c.heroCopy[lang]}</p>
          </section>
          <aside className="release-card" aria-label={c.releaseAria[lang]}>
            <p>WORKING RELEASE DATE</p>
            <strong>2026. 11. 13</strong>
            <span>{c.releaseSub[lang]}</span>
            <div className="release-rule" />
            <dl>
              <div><dt>{c.dlTotal[lang]}</dt><dd>{formatWon(1300000, lang)}</dd></div>
              <div><dt>{c.dlAudio[lang]}</dt><dd>{formatWon(500000, lang)}</dd></div>
              <div><dt>{c.dlVideo[lang]}</dt><dd>{formatWon(800000, lang)}</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      <section className="snapshot" aria-label={c.snapshotAria[lang]}>
        {snapshot.map((s) => (
          <article key={s.n}><span>{s.n}</span><div><b>{s.d}</b><p>{s.label[lang]}</p></div></article>
        ))}
      </section>

      <section className="section-shell" id="budget">
        <div className="section-heading">
          <div><p className="eyebrow">BUDGET</p><h2>{c.budgetHeading[lang]}</h2></div>
          <p className="budget-heading-total">{c.budgetSummary[lang]}</p>
        </div>

        <div className="budget-groups">
          {budgetGroups.map((group) => (
            <article className={`budget-group budget-${group.key}`} key={group.key}>
              <header><span>{group.number}</span><h3>{group.title[lang]}</h3><strong>{formatWon(group.total, lang)}</strong></header>
              <table>
                <thead><tr><th>{c.colItem[lang]}</th><th>{c.colAmount[lang]}</th></tr></thead>
                <tbody>
                  {group.rows.map(([item, amount]) => (
                    <tr key={item.ko}><td>{item[lang]}</td><td>{formatWon(amount, lang)}</td></tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
        <div className="budget-grand-total"><span>WORKING BUDGET</span><strong>1,300,000원</strong></div>
        <p className="budget-condition">{c.budgetNote[lang]}</p>
      </section>

      <section className="section-shell" id="rights">
        <div className="section-heading">
          <div><p className="eyebrow">CREDIT &amp; RIGHTS</p><h2>{c.rightsHeading[lang]}</h2></div>
          <p className="budget-heading-total">{c.rightsSummary[lang]}</p>
        </div>

        <div className="meeting-columns">
          {rightsColumns.map((col) => (
            <article key={col.key}>
              <span className="meeting-number">{col.key}</span><h3>{col.title[lang]}</h3>
              <ol>
                {col.items.map(([b, s]) => (
                  <li key={b.ko}><b>{b[lang]}</b><small>{s[lang]}</small></li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        <p className="budget-condition">{c.rightsNote[lang]}</p>
        <p className="budget-condition">{c.rightsNote2[lang]}</p>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="section-shell">
          <div className="section-heading light-heading">
            <div><p className="eyebrow">11-WEEK ROADMAP</p><h2>{c.roadmapHeading[lang]}</h2></div>
            <p>{c.roadmapLead[lang]}</p>
          </div>

          <div className="track-labels"><span>{c.trackAudio[lang]}</span><span>{c.trackVideo[lang]}</span></div>
          <div className="roadmap-list">
            {roadmap.map((r) => (
              <article key={r.num} className={'final' in r && r.final ? 'final-roadmap' : undefined}>
                <div className="roadmap-date"><b>{r.from}</b><span>{r.to}</span></div>
                <div className="roadmap-track audio-track"><i>{r.num}</i><h3>{r.a[0][lang]}</h3><p>{r.a[1][lang]}</p></div>
                <div className="roadmap-track video-track"><h3>{r.v[0][lang]}</h3><p>{r.v[1][lang]}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="calendar-section" id="calendar">
        <div className="calendar-heading">
          <div><p className="eyebrow">MASTER CALENDAR</p><h2>2026. 09 — 11</h2></div>
          <div className="legend">
            <span className="event-audio">{c.legendAudio[lang]}</span>
            <span className="event-video">{c.legendVideo[lang]}</span>
            <span className="event-decision">{c.legendDecision[lang]}</span>
            <span className="event-release">{c.legendRelease[lang]}</span>
          </div>
        </div>
        <div className="months">{calendarMonths.map((month) => <CalendarMonth key={month.month} data={month} lang={lang} />)}</div>
        <p className="calendar-note">{c.calNote[lang]}</p>
      </section>

      <section className="meeting-section" id="meeting">
        <div className="meeting-title">
          <p className="eyebrow">KICKOFF · 2026.09.02</p>
          <h2>{c.meetHeading[lang]}</h2>
          <p>{c.meetLead[lang]}</p>
        </div>
        <div className="meeting-columns meeting-three">
          {meetingColumns.map((col) => (
            <article key={col.key}>
              <span className="meeting-number">{col.key}</span>
              <h3>{col.title[lang]}<br /><em>{col.sub[lang]}</em></h3>
              <ol>
                {col.items.map(([b, s]) => (
                  <li key={b.ko}><b>{b[lang]}</b><small>{s[lang]}</small></li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div><span>LOW STAR · RELEASE PLAN</span><b>{c.footerDate[lang]}</b></div>
        <p>{c.footerNote[lang]}</p>
      </footer>
    </main>
  );
}
