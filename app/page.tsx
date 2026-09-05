'use client';

import { useEffect, useMemo, useState } from 'react';

type Lang = 'ko' | 'en';
type L = { ko: string; en: string };

const t = (ko: string, en: string): L => ({ ko, en });

const budgetGroups = [
  {
    key: 'audio', number: '01', title: t('음원 제작', 'Recording'),
    caption: t('녹음 9월 · 믹스 10월', 'Recording in Sep, mix in Oct'), total: 500000,
    rows: [
      [t('녹음 프로덕션', 'Studio recording'), 200000],
      [t('믹스 · 마스터', 'Mixing and mastering'), 300000],
    ] as [L, number][],
  },
  {
    key: 'art', number: '02', title: t('그림 · 스톱모션', 'Art and stop motion'),
    caption: t('사례비 11월 · 재료비 2회 분할', 'Fees in Nov, materials in two parts'), total: 720000,
    rows: [
      [t('기획 · 미술 2명 × 25만 원', 'Art direction, 2 people at 250,000'), 500000],
      [t('스톱모션 · 소품 · 미술 재료', 'Stop motion, props and art materials'), 180000],
      [t('조명 · 촬영 세팅', 'Lighting and rig'), 40000],
    ] as [L, number][],
  },
  {
    key: 'scout', number: '03', title: t('영상 — 사전답사', 'Video: the scout'),
    caption: t('9/13 낮 · 무박 · 4인 · 제작자 세단', '13 Sep, same day · four people · one sedan'), total: 200000,
    rows: [
      [t('차량 보험 (하루 특약)', 'One day insurance rider'), 20000],
      [t('유류 · 왕복 486km', 'Fuel, 486km round trip'), 100000],
      [t('통행료', 'Tolls'), 30000],
      [t('4인 식대 (점심 · 귀경길)', 'Meals for four'), 50000],
    ] as [L, number][],
  },
  {
    key: 'shoot', number: '04', title: t('영상 — 본촬영', 'Video: the shoot'),
    caption: t('9/19–20 · 6인 · 9인승 렌트', '19–20 Sep · six people · one nine seater'), total: 1980000,
    rows: [
      [t('촬영장비 대여', 'Equipment rental'), 800000],
      [t('9인승 렌터카 · 자차 포함', 'Nine seater with damage waiver'), 180000],
      [t('경유 · 주행거리 초과분', 'Diesel and distance overage'), 100000],
      [t('통행료 · 주차', 'Tolls and parking'), 40000],
      [t('6인 1박 숙박', 'One night, six people'), 200000],
      [t('6인 식대', 'Meals for six'), 240000],
      [t('저장 · 백업 매체', 'Storage and backup media'), 10000],
      [t('예비비', 'Contingency'), 80000],
      [t('의상 · 소품', 'Costume and props'), 30000],
      [t('촬영 사례비', 'Fee, cinematography'), 100000],
      [t('일일스태프 2명 × 10만 원', 'Two day crew at 100,000'), 200000],
    ] as [L, number][],
  },
] as const;

const budgetTotal = budgetGroups.reduce((sum, group) => sum + group.total, 0);
// 진짜 제약은 총액이 아니라 월 지출 150만 원이다. 결제 시점으로 세 달에 나눈다.
const budgetCeiling = 3400000;

// 확정 전이라 숫자가 움직일 수 있는 항목. 웹에서 그대로 드러낸다.
// 2026-09-05: 계약서 네 건의 공백(무박 1일 · 이동비 상한 · 일일스태프 계약 · 장비 파손 배상)은 모두 반영 완료.
const budgetPending = [
  [t('로케이션', 'The location'), t('9월 13일 답사에서 확정한다. 망상이 1순위이나 미정이다. 본촬영 숙박 20만 원과 통행 · 주차 4만 원이 이 결정에 따라 움직인다', 'Fixed on the scouting trip of 13 September. Mangsang is the front runner but nothing is settled. The 200,000 for lodging on the shoot and the 40,000 for tolls and parking both move with this decision')],
  [t('장비 품목', 'Which equipment'), t('9월 9일 씬리스트 회의 뒤 촬영 담당이 정한다. 총액 80만 원은 상한으로 확정이고, 안에서 무엇을 빌릴지는 열려 있다', 'Decided by the cinematographer after the shot list meeting on 9 September. The 800,000 is a fixed ceiling; what gets hired inside it is open')],
  [t('렌터카 업체', 'Which rental company'), t('카니발 9인승으로 촬영 담당이 조사한다. 단독사고를 자차가 덮는지 계약 전에 전화로 확인해야 한다 — 현장에서 가장 흔한 사고가 후진 중 연석 접촉이다', 'The cinematographer sources a nine seat Carnival. Whether the damage waiver covers single vehicle accidents has to be confirmed by phone before booking, because the commonest accident on a shoot is reversing into a kerb')],
  [t('새벽 해변의 사람 수', 'How busy the beach is at dawn'), t('일요일 06:00에 해맞이 인파가 있으면 실루엣 컷 프레임이 죽는다. 답사를 낮으로 돌렸으므로 이건 9월 7일 동해시청 통화에서 확인한다', 'If people gather for the sunrise at six on a Sunday, the silhouette frames are unusable. Since the scout now goes in daylight, this gets asked on the 7 September call to the city office instead')],
] as [L, L][];

const formatWon = (value: number, lang: Lang) =>
  lang === 'ko'
    ? `${(value / 10000).toLocaleString('ko-KR')}만 원`
    : `₩${value.toLocaleString('en-US')}`;

type CalendarTrack = 'album' | 'mv';
type TrackFilter = 'all' | CalendarTrack;
type CalendarEvent = { title: L; kind: 'audio' | 'video' | 'release' | 'decision'; track: CalendarTrack | 'both' };

const calFilters: { key: TrackFilter; label: L }[] = [
  { key: 'all', label: t('전체', 'All') },
  { key: 'album', label: t('앨범 작업', 'Album') },
  { key: 'mv', label: t('뮤비 작업', 'Music video') },
];

// 'both' 는 두 트랙이 반드시 만나는 지점이라 어느 보기에서도 사라지지 않는다.
const inTrack = (event: CalendarEvent, filter: TrackFilter) =>
  filter === 'all' || event.track === 'both' || event.track === filter;

const calendarMonths = [
  {
    name: 'SEPTEMBER', month: 9, label: t('9월', 'Sep'), start: 2, days: 30,
    events: {
      2: [{ title: t('제작팀 킥오프', 'Team kickoff'), kind: 'decision', track: 'both' }],
      4: [{ title: t('유통사 3곳 문의', 'Contact 3 distributors'), kind: 'release', track: 'album' }],
      9: [{ title: t('발매일 · 유통사 · 콘티 확정', 'Date, distributor, boards'), kind: 'decision', track: 'both' }],
      13: [
        { title: t('가녹음 · 가믹스', 'Scratch take'), kind: 'audio', track: 'album' },
        { title: t('동해 사전답사 (당일)', 'Location scout, same day'), kind: 'video', track: 'mv' },
      ],
      16: [{ title: t('스톱모션 기획안 확정', 'Stop motion plan due'), kind: 'video', track: 'mv' }],
      18: [{ title: t('본녹음 · 편집 완료', 'Final take done'), kind: 'audio', track: 'album' }],
      19: [{ title: t('동해 이동 · 밤 촬영', 'Travel and night shoot'), kind: 'video', track: 'mv' }],
      20: [{ title: t('동해 촬영 (1순위)', 'East Sea shoot'), kind: 'decision', track: 'mv' }],
      21: [
        { title: t('믹스 · 마스터 파일 전달', 'Files to the engineer'), kind: 'audio', track: 'album' },
        { title: t('스톱모션 본제작 착수', 'Stop motion starts'), kind: 'video', track: 'mv' },
      ],
      23: [{ title: t('기상 예비일', 'Weather backup'), kind: 'video', track: 'mv' }],
    } as Record<number, CalendarEvent[]>,
  },
  {
    name: 'OCTOBER', month: 10, label: t('10월', 'Oct'), start: 4, days: 31,
    events: {
      3: [{ title: t('스톱모션 본제작 완료', 'Stop motion complete'), kind: 'video', track: 'mv' }],
      5: [{ title: t('러프컷 V1', 'Rough cut V1'), kind: 'video', track: 'mv' }],
      8: [{ title: t('믹스 · 마스터 완료', 'Mix and master done'), kind: 'audio', track: 'album' }],
      9: [{ title: t('유통자료 제출', 'Assets to distributor'), kind: 'decision', track: 'album' }],
      12: [{ title: t('피드백 V2', 'Feedback V2'), kind: 'video', track: 'mv' }],
      15: [{ title: t('픽처락 · 색보정', 'Picture lock and grade'), kind: 'video', track: 'mv' }],
      16: [{ title: t('뮤직비디오 최종본', 'Final music video'), kind: 'decision', track: 'mv' }],
      17: [{ title: t('업로드 · 티저 시작', 'Upload and teaser'), kind: 'release', track: 'both' }],
      23: [{ title: t('음원 · MV 동시 공개', 'Single and MV out'), kind: 'release', track: 'both' }],
    } as Record<number, CalendarEvent[]>,
  },
] as const;

const weekdays: Record<Lang, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
};

const snapshot = [
  { n: '01', d: '09.02', label: t('제작팀 킥오프 회의', 'Team kickoff meeting') },
  { n: '02', d: '09.16', label: t('스톱모션 기획안 확정', 'Stop motion plan confirmed') },
  { n: '03', d: '09.19—20', label: t('동해 1박 2일 · 예비일 09.23', 'East Sea, two days, backup 09.23') },
  { n: '04', d: '10.09', label: t('유통자료 제출', 'Assets delivered to distributor') },
  { n: '05', d: '10.16', label: t('뮤직비디오 최종본 완성', 'Final music video locked') },
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
    v: [t('제작팀 첫 회의', 'First team meeting'), t('권리와 크레딧, 예산, 콘셉트, 역할, 촬영일 결정', 'Rights and credits, budget, concept, roles and the shoot date')] as [L, L],
  },
  {
    from: '09.03', to: '— 09.09', num: '02',
    a: [t('곡 구조 잠금', 'Song structure locked'), t('BPM · 구성 · 전체 길이 확정, 유통사 리드타임 확인', 'Tempo, form and length fixed. Distributor lead time confirmed')] as [L, L],
    v: [t('콘티 · 로케이션 확정', 'Boards and location locked'), t('동해 필수 컷 확정. 스톱모션 기획과 분리해 먼저 잠근다', 'East Sea shot list fixed, ahead of the stop motion plan')] as [L, L],
  },
  {
    from: '09.10', to: '— 09.18', num: '03',
    a: [t('가녹음 · 본녹음', 'Recording'), t('09.13 가녹음 · 09.16–18 본녹음과 편집', 'Scratch take on 09.13, final take and editing 09.16–18')] as [L, L],
    v: [t('스톱모션 기획안 확정', 'Stop motion plan confirmed'), t('기법 · 분량 · 프레임레이트 · 작업 공간 · 재료 목록 결정', 'Technique, length, frame rate, workspace and material list')] as [L, L],
  },
  {
    from: '09.19', to: '— 09.23', num: '04',
    a: [t('믹스 · 마스터 전달', 'Files to the engineer'), t('09.21 파일 전달. 추석 전에 넘겨 작업 슬롯을 확보한다', 'Delivered on 09.21, before the holiday, to secure the slot')] as [L, L],
    v: [t('동해 촬영', 'East Sea shoot'), t('09.19 이동 · 1박 → 09.20 일출 06:08. 09.23 기상 예비일', 'Travel on 09.19 and stay the night; sunrise 06:08 on 09.20. Weather backup on 09.23')] as [L, L],
  },
  {
    from: '09.24', to: '— 10.08', num: '05',
    a: [t('믹스 · 마스터', 'Mixing and mastering'), t('추석 이후 09.28–10.08. 수정 2회 포함', 'From 09.28 to 10.08 after the holiday, two revision rounds included')] as [L, L],
    v: [t('스톱모션 본제작', 'Stop motion production'), t('09.21–10.03 프레임 촬영 · 드로잉 애니메이션', 'Frame by frame shooting and drawn animation, 09.21 to 10.03')] as [L, L],
  },
  {
    from: '10.09', to: '— 10.16', num: '06',
    a: [t('유통자료 제출', 'Assets delivered'), t('커버 · 소개글 · 크레디트와 함께 10.09 제출', 'Artwork, notes and credits submitted on 10.09')] as [L, L],
    v: [t('후반작업', 'Post production'), t('러프컷 V1 10.05 → 피드백 V2 10.12 → 픽처락 10.15 → 최종본 10.16', 'Rough cut 10.05, feedback 10.12, picture lock 10.15, final 10.16')] as [L, L],
  },
  {
    from: '10.17', to: '— 10.23', num: '07', final: true,
    a: [t('공개 준비', 'Release preparation'), t('프리세이브 · 채널 정리 · 링크와 게시물 예약', 'Pre-save, channels, links and scheduled posts')] as [L, L],
    v: [t('동시 공개', 'Simultaneous release'), t('10월 23일 음원과 뮤직비디오 동시 공개 · 크레딧과 참여확인서 발행', 'Single and music video released together on 23 October. Credits and certificates issued')] as [L, L],
  },
] as const;

const meetingColumns = [
  {
    key: 'A',
    title: t('정하고 가는 것', 'Decided in advance'),
    sub: t('받아들일 수 있는지 확인', 'We only confirm you can accept it'),
    items: [
      [t('월 지출 150만 원이 한계', 'The limit is 1,500,000 a month'), t('총 340만. 9월 222 · 10월 38 · 11월 80. 9/12 하루에 165만이 나간다', 'Total 3,400,000, split 2,220,000 / 380,000 / 800,000. A single 1,650,000 transfer goes out on 12 September')],
      [t('늘어난 금액은 제작자가 부담', 'The increase is the producer’s'), t('참여자에게 분담을 요청하지 않는다. 교통 · 숙박 · 식사는 전액 제작자 부담', 'No participant is asked to share it. Travel, lodging and meals are fully covered')],
      [t('사례비', 'Fees'), t('기획 · 미술 각 25만 원, 동해 촬영 10만 원, 일일스태프 각 10만 원', '250,000 each for art, 100,000 for the shoot, 100,000 for each day crew member')],
      [t('재료비 18만 원', 'Materials 180,000'), t('제작자가 선지급하며 참여자 지출이 없게 한다', 'Paid in advance so that you never spend your own money')],
      [t('음원 50만 원은 타협하지 않는다', 'The 500,000 for audio is not negotiable'), t('곡이 본체이고 뮤비는 곡을 알리는 수단이다', 'The song is the work. The video carries it')],
      [t('동해는 1박 2일', 'Two days at the East Sea'), t('일출 06:08 때문이다. 무박으로는 골든아워 40분을 못 잡는다', 'Because the sun rises at 06:08. A single day cannot reach that forty minute window')],
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
      [t('동해 현장 인원', 'Crew on location'), t('9/13 답사 4명 · 세단 · 당일 왕복 / 9/20 촬영 6명 · 9인승 렌트 1대, 운전자 2명 등록', 'Four scout on 13 Sep by sedan and back the same day; six shoot on 20 Sep in one nine seater with two registered drivers')],
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
      [t('동해 필수 컷', 'Essential East Sea shots'), t('필수 다섯 컷으로 확정. 나머지는 예비로 내린다', 'Fixed at five essential shots. Everything else drops to backup')],
      [t('비가 왔을 때', 'If it rains'), t('대안 로케이션 · 예비일 재시도 · 후일 단독 촬영 중 택1', 'Alternate location, backup day, or a later solo shoot')],
      [t('스톱모션 작업 공간', 'Stop motion workspace'), t('몇 주간 세팅을 고정해 둘 자리가 필요하다', 'A corner that can stay untouched for weeks')],
    ] as [L, L][],
  },
] as const;

// 모든 문장은 카메라가 기록할 수 있는 것만 적는다. 속마음 · 분위기 · 의미는 쓰지 않는다.
const storyBeats = [
  {
    n: '01', title: t('멈춘 항구', 'The harbour that cannot leave'),
    body: t(
      '물이 빠지면 배들이 젖은 모래 위에 비스듬히 올라앉는다. 배마다 검은 닻이 박혀 있고, 닻이 배보다 크다. 선원 넷이 밧줄을 당기다 뒤로 나동그라진다. 한 명은 닻 앞에 쪼그려 앉아 뒤통수를 긁고, 다른 한 명은 닻을 발로 찼다가 발가락을 붙잡고 뛴다. 화면에 빨강이 0%다.',
      'When the tide goes out the boats settle at an angle on the wet sand, each pinned by a black anchor bigger than the boat itself. Four sailors haul on a rope and tumble backwards. One squats in front of the anchor and scratches the back of his head; another kicks it, then hops holding his toe. There is no red anywhere in the frame.',
    ),
  },
  {
    n: '02', title: t('첫 번째 빨강', 'The first red'),
    body: t(
      '소녀가 두 손을 모아 빈다. 별 옆에 빨간 점이 생기고, 그 풍선을 잡은 소년이 내려온다. 내려오는 동안 풍선의 빨강이 검게 식는다. 소년만 종이처럼 얇은 2D다. 소년이 검은 닻을 쥐면 손끝에서 빨강이 번져 표면을 한 바퀴 돈다. 닻이 모래에서 빠져 머리 위 30센티까지 떠오른다.',
      'The girl presses her hands together and wishes. A red dot appears beside the star; a boy comes down holding it as a balloon, and the red cools to black as he descends. He alone is a flat, paper thin 2D drawing. When he grips a black anchor, red spreads from his fingertips and wraps once around it. The anchor lifts out of the sand and floats thirty centimetres above his head.',
    ),
  },
  {
    n: '03', title: t('빈 선착장', 'The empty pier'),
    body: t(
      '배들이 떠난 뒤 소년이 옷깃을 세우고 포즈를 잡는다. 박수 소리가 나던 쪽으로 고개를 홱 돌린다. 사람이 없다. 박수 소리가 그 프레임에서 뚝 끊기고 파도 소리만 남는다. 소년이 옷깃을 손가락 두 개로 슬며시 눕힌다. 이제 그를 보는 사람은 소녀 하나뿐이다.',
      'After the boats leave, the boy stiffens his collar and holds a pose. He whips his head towards the applause. Nobody is there. The applause cuts out on that exact frame and only the waves remain. He quietly folds his collar back down with two fingers. From here the girl is the only audience he has.',
    ),
  },
  {
    n: '04', title: t('조약돌 — 되돌리고 싶은 단 하나', 'The pebble, the one thing he would take back'),
    body: t(
      '소녀가 두 손으로 검은 조약돌을 내민다. 돌이 손바닥을 눌러 내린다. 소년의 다섯 손가락은 이미 돌 아래에 반쯤 오므라져 있다. 하나만 접으면 닿는다. 소년은 대신 검지로 톡 치고 손바닥을 활짝 편다. 돌이 뜬다. 소녀의 두 손이 허공에 남았다가 천천히 오므라들어 빈손이 된다.',
      'She holds out a black pebble in both hands; its weight presses her palms down. His five fingers are already half closed beneath it. One more would have caught it. Instead he taps it with an index finger and opens his palm flat. The stone floats. Her two hands stay open in the air, then slowly close on nothing.',
    ),
  },
  {
    n: '05', title: t('드림캐처 — 그가 없앤 무게', 'The dreamcatcher, the weight she rebuilt'),
    body: t(
      '밤, 소녀의 손만 프레임에 있다. 왼손이 떠오르려는 붉은 돌을 눌러 잡고 오른손이 초록 실을 한 겹 감는다. 손을 뗀다. 아직 뜬다. 세 번째에 돌이 멈춘다. 그제야 말린 초록 잎을 붙이기 시작한다. 다음 날 소년은 가운데 붉은 돌만 가리키고, 뒤집지 않은 채 목에 건다.',
      'At night, only her hands are in frame. The left one holds down the floating red stone while the right winds a layer of green thread. She lets go. It still lifts. On the third layer it finally stays. Only then does she begin tying on the dried green leaves. The next day he points at the red stone in the centre, and hangs it around his neck without ever turning it over.',
    ),
  },
  {
    n: '06', title: t('잘 해보려 했던 건데', 'I was only trying'),
    body: t(
      '고정 와이드, 6초. 아무것도 움직이지 않는다. 천장에 붉은 물건이 빽빽하게 떠 창을 막았고, 그 아래 초록 화분이 눌려 있다. 붉은 물건마다 초록 끈이 하나씩 묶여 있다. 창가에 소녀가 엎드려 잠들어 있다. 소년이 만든 천장 아래에서.',
      'A locked wide shot, six seconds, nothing moving. Red objects crowd the ceiling and block the window; the green plants are pressed beneath them. Each red object has a single green string tied around it. By the window the girl has fallen asleep at the desk, under the ceiling he built.',
    ),
  },
  {
    n: '07', title: t('별과 추락', 'The star and the fall'),
    body: t(
      '소년의 검지가 하늘의 별들을 하나씩 짚고 지나친다. 크고 밝은 것을 지나치고, 수평선 바로 위 제일 작고 흐린 점에서 멈춘다. 소녀는 하늘을 안 본다. 고개를 숙이고 매듭을 고쳐 매고 있다. 소년은 소녀의 손가락을 하나씩 떼어내 가슴 앞에 포개어 놓아준다. 그 자세 그대로 소녀가 잠든다. 창문의 불이 꺼진 뒤에 소년이 혼자 올라간다.',
      'His index finger passes over the stars one by one. It skips the big bright ones and stops on the smallest, faintest point just above the horizon. She never looks up; her head is down, retying a knot. He peels her fingers off his wrist one at a time and folds her hands in front of her chest. She falls asleep in exactly that position. Only after her window goes dark does he rise alone.',
    ),
  },
  {
    n: '08', title: t('뒤집는다', 'He turns it over'),
    body: t(
      '젖은 검은 모래. 드림캐처가 첫 컷에서 파도가 밀어놓은 그 자리에 있다. 소년의 손이 습관대로 검은 돌에 얹힌다. 아무 일도 일어나지 않는다. 손이 물건을 뒤집는다. 바닥면에 초록 실 매듭과 말린 잎과 바다유리가 있다. 하나도 바래지 않았다. 얼굴은 넣지 않는다. 손과 물건만.',
      'Wet black sand. The dreamcatcher lies exactly where the waves pushed it in the opening shot. His hand settles on the black stone out of habit. Nothing happens. The hand turns the object over. On the underside are the green knots, the dried leaves and the sea glass, none of them faded. No face in the frame. Only hands and the object.',
    ),
  },
  {
    n: '09', title: t('노래가 끝난 뒤', 'After the song ends'),
    body: t(
      '실사. 몇 년 뒤. 넓은 해변, 골든아워. 아주 멀리 초록색 옷의 사람이 바다를 보고 앉아 있다. 등을 돌리고 있다. 남자가 그쪽으로 걸어간다. 뒷모습, 빈손. 카메라는 고정이고 자르지 않는다. 도착하기 전에 끝난다. 소리는 파도와 바람과 모래 밟는 소리뿐이다.',
      'Live action, years later. A wide beach at golden hour. Far away someone in green sits facing the sea, their back turned. A man walks towards them, seen from behind, hands empty. The camera is locked and never cuts. It ends before he arrives. The only sound is waves, wind and footsteps in sand.',
    ),
  },
] as const;

const shootMust = [
  {
    n: '①', when: t('9/19 밤', '19 Sep, night'),
    title: t('밤 와이드 롱테이크', 'Night wide, long take'),
    body: t('검은 해변. 화면 위 4/5가 밤하늘, 아래 구석에 옆으로 누운 종이 소년. 인물은 한 프레임도 움직이지 않는다.', 'Black beach. Four fifths of the frame is night sky; the paper boy lies in the lower corner. He does not move for a single frame.'),
    ok: t('40초 이상 안 끊고 3테이크. 이 한 테이크의 앞부분이 첫 컷, 뒷부분이 착지 컷.', 'Three takes, forty seconds or more, uncut. The head of this take is the opening shot; the tail is the crash landing.'),
  },
  {
    n: '②', when: t('9/19 밤', '19 Sep, night'),
    title: t('물웅덩이 밤하늘 반영', 'Night sky in the tide pool'),
    body: t('얕은 물에 밤하늘이 통째로 비친다. 여기서 스톱모션으로 넘어간다.', 'The whole night sky reflected in shallow water. This is where the film cuts into stop motion.'),
    ok: t('웅덩이는 만든다. 모래 20센티 파고 검은 비닐봉투를 깔고 바닷물을 붓는다. 0원.', 'We build the pool: dig twenty centimetres, line it with a black bin bag, pour in seawater. Costs nothing.'),
  },
  {
    n: '③', when: t('9/20 05:45', '20 Sep, 05:45'),
    title: t('여명 롱 플레이트', 'Dawn plate'),
    body: t('수평선이 저 혼자 붉어지기 시작한다. 카메라는 ①과 같은 자리에서 움직이지 않는다.', 'The horizon reddens on its own. The camera has not moved since shot ①.'),
    ok: t('하나의 롱테이크에서 잘라 쓴다. 둘로 나누면 하늘색이 안 이어진다. 일출을 완성시키지 않는다.', 'Cut from a single take. Two plates will not match. The sunrise is never allowed to complete.'),
  },
  {
    n: '④', when: t('9/20 06:20', '20 Sep, 06:20'),
    title: t('코다 — 걸어가는 남자', 'The coda, a man walking'),
    body: t('멀리 앉은 초록 형체. 남자가 그쪽으로 걸어간다. 도착 전에 끝난다.', 'A green figure far away. A man walks towards them. It ends before he arrives.'),
    ok: t('40초 이상 안 끊고 4테이크. 거리가 좀처럼 안 줄어 보일 것. 현장음 필수.', 'Four takes, forty seconds or more, uncut. The gap must barely seem to close. Location sound is required.'),
  },
  {
    n: '⑤', when: t('아무 때나', 'Any time'),
    title: t('파도 플레이트', 'Wave plates'),
    body: t('파도가 젖은 모래를 훑고 지나간다. 렌즈를 지면 5센티에.', 'Waves sweeping over wet sand, lens five centimetres off the ground.'),
    ok: t('시간에 안 묶인 유일한 필수 컷. 여러 각도로 넉넉히.', 'The only essential shot not tied to a time of day. Shoot plenty, from several angles.'),
  },
] as const;

const shootColumns = [
  {
    key: 'A', title: t('실내로 뺀다', 'Moved indoors'),
    sub: t('동해에서 안 찍는다', 'Not shot on location'),
    items: [
      [t('드림캐처 뒤집는 손', 'The hand turning the dreamcatcher'), t('젖은 모래 밑 낚싯줄로 뒤집고 그 위에 2D 손을 얹는다', 'Fishing line under the sand flips it; a 2D hand is composited on top')],
      [t('조약돌 3단계', 'The pebble in three states'), t('검정 · 반쯤 붉어진 상태 · 떠 있는 상태', 'Black, half turned red, floating')],
      [t('손바닥 · 주먹 · 주머니', 'Palm, fist, pocket'), t('작품의 척추. 재촬영이 무제한이어야 한다', 'The spine of the film. It needs unlimited takes')],
      [t('계단 · 유리 물방울 · 스위치', 'Stairs, water on glass, a switch'), t('집 · 아파트 계단 · 욕실 · 창문에서 전부 된다', 'All of it works in a flat, a stairwell, a bathroom, a window')],
      [t('클로즈업 전부', 'Every close up'), t('배경에 손밖에 안 보인다. 해변에서 찍을 이유가 없다', 'Only the hand is visible anyway. There is no reason to shoot it on a beach')],
    ] as [L, L][],
  },
  {
    key: 'B', title: t('예비', 'Backup'),
    sub: t('못 찍어도 성립한다', 'The film survives without these'),
    items: [
      [t('등대 불빛이 도는 그림', 'The lighthouse beam turning'), t('어두울 때만. 삼각대 고정해두고 방치해도 담긴다', 'Only in darkness. Lock off a tripod and let it run')],
      [t('등대 실루엣 원경', 'Lighthouse in silhouette'), t('밤 와이드 배경에 딸려 오면 세팅 0', 'If it lands in the night wide, it costs no setup at all')],
      [t('기어온 자국 세 줄', 'Three drag marks in the sand'), t('간조에, 파도선 위쪽에. 파도 컷보다 먼저', 'At low tide, above the wave line, before the wave shots')],
      [t('발자국과 그것을 지우는 파도', 'Footprints erased by a wave'), t('밝은 뒤에 찍는다', 'After it is fully light')],
      [t('악천후 아웃포인트', 'Bad weather ending'), t('검은 바다 · 수평선 롱 홀드. 흐려도 끝낼 수 있는 컷이 하나는 있어야 한다', 'A long hold on dark sea and horizon. One ending must survive an overcast morning')],
    ] as [L, L][],
  },
  {
    key: 'C', title: t('안 찍는다', 'Never shot'),
    sub: t('이 목록을 지키는 것이 계획이다', 'Holding this list is the plan'),
    items: [
      [t('노을', 'Sunset'), t('동해안은 바다 위 일몰이 물리적으로 없다. 해는 산 뒤로 진다', 'On this coast the sun sets behind mountains. Sunset over the sea does not exist here')],
      [t('드론 · 방파제 위 인물', 'Drones, anyone on the breakwater'), t('허가 두 건과 과태료 100만 원. 그리고 생명 위험', 'Two separate permits, a one million won fine, and a real risk to life')],
      [t('얼굴이 보이는 컷', 'Any shot showing a face'), t('배우가 필요 없어지고 연기 실패가 불가능해진다', 'It removes the need for actors and makes a bad performance impossible')],
      [t('완성된 일출', 'A completed sunrise'), t('아침이 완성되면 그가 성공한 것이 된다', 'If the morning completes, he succeeded. He must not')],
      [t('즉흥 컷 전부', 'Anything unplanned'), t('하나 들어오면 30초가 2~3초 인서트 12개로 흩어진다', 'One of them scatters thirty seconds into a dozen two second inserts')],
    ] as [L, L][],
  },
] as const;

const c = {
  navStory: t('시놉시스', 'Story'),
  navShoot: t('촬영', 'Shoot'),
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
  releaseSub: t('FRIDAY · 제안 · 제작팀 · 유통사 협의 후 확정', 'FRIDAY · proposed, to be agreed with the team and the distributor'),
  dlTotal: t('총액', 'Total'),
  dlSep: t('9월 지출', 'September'),
  dlCap: t('월 한계', 'Monthly cap'),
  dlAudio: t('음원', 'Audio'),
  dlVideo: t('뮤직비디오', 'Video'),
  budgetHeading: t('총 340만 원', 'Total 3,400,000 KRW'),
  budgetSummary: t('9월 222 · 10월 38 · 11월 80', 'Sep 222 · Oct 38 · Nov 80 (in 10,000 KRW)'),
  colItem: t('항목', 'Item'),
  colAmount: t('금액', 'Amount'),
  budgetNote: t(
    '* 사례비는 기획 · 미술 각 25만 원, 동해 촬영 10만 원입니다. 교통 · 유류 · 통행 · 주차 · 숙박 · 식사는 사례비와 분리해 전액 제작자가 부담하며, 참여자가 비용을 먼저 지출하지 않도록 선지급합니다. 재료비 18만 원은 콘셉트 확정 후와 중간 점검 후 두 차례로 나누어 지급하고, 영수증 제출 의무는 없으며 남은 금액은 참여자에게 귀속됩니다. 9월 13일 사전답사는 4명이 세단 한 대로 당일 왕복합니다 — 구도와 삼각대 자리는 낮에 정해지고, 새벽 리허설은 어차피 9월 19일 밤 촬영이 대신합니다. 9월 20일 본촬영은 6명이 9인승 렌트 한 대로 움직입니다. 차는 한 대여도 운전자는 두 명 등록해, 새벽 촬영에 묶였던 사람이 복귀 운전을 맡지 않도록 합니다.',
    '* Fees are 250,000 for each art lead and 100,000 for the shoot. Travel, fuel, tolls, parking, lodging and meals sit outside the fees and are fully covered by the producer, paid in advance so that nobody spends their own money first. The 180,000 materials budget is released in two parts, after the concept is fixed and after the mid point check; no receipts are required and any remainder belongs to the participant. Four people scout on 13 September in one sedan and drive home the same day: framing and tripod positions are daylight work, and the night shoot on the 19th is the real dawn rehearsal. Six shoot on 20 September in a single nine seater. Even with one car two drivers are registered, so nobody who worked the dawn shoot has to drive home.',
  ),
  budgetWhyHeading: t('제약은 총액이 아니라 월 지출이다', 'The constraint is monthly, not total'),
  budgetCreativeHeading: t('9월 지출 상세', 'September, item by item'),
  budgetWhy: t(
    '총액 340만 원 가운데 222만 원이 9월에 몰립니다. 사전답사 · 본촬영 · 촬영장비가 전부 9월이기 때문입니다. 10월은 38만 원(믹스 · 마스터 30, 재료비 2차 8), 사례비 80만 원은 발매 2주 뒤인 11월에 나갑니다. 특히 9월 12일 하루에 촬영 예산 165만 원이 한 번에 이체됩니다 — 렌터카와 장비 예약이 그 주에 걸려 있기 때문입니다. 9월 한 달만 한도 150만 원을 넘고, 10월과 11월은 그 아래입니다.',
    'Of the 3,400,000 total, 2,220,000 falls in September, because the scout, the shoot and the equipment rental all sit in that month. October is 380,000 (mix and master, second materials payment) and the 800,000 in fees is paid two weeks after release, in November. Note that 1,650,000 leaves the account in a single transfer on 12 September, because the vehicle and the equipment must be booked that week.',
  ),
  budgetCreative: t(
    '9월 6~8일 의상 재료 3만 원과 본촬영 숙소 가예약(무료취소이므로 결제 없음). 9월 12일 촬영 담당에게 165만 원 일괄 이체 — 장비 80, 렌터카 18, 경유 10, 통행 · 주차 4, 숙박 20, 식대 24, 저장매체 1, 예비 8. 9월 13일 사전답사 실비 20만 원(보험 2 · 기름 10 · 통행 3 · 4인 식대 5). 이틀 사이에 185만 원이 빠지므로 9월 11일까지 200만 원이 준비되어 있어야 합니다. 9월 16일 이후 미술 재료비 1차 10만 원과 스톱모션 조명 · 세팅 4만 원. 그리고 9월 중 음원 녹음 프로덕션 20만 원.',
    'Costume materials of 30,000 on 6–8 September, plus a provisional lodging booking for the shoot that costs nothing to hold. On 12 September a single transfer of 1,650,000: 800,000 equipment, 180,000 vehicle, 100,000 diesel, 40,000 tolls and parking, 200,000 lodging, 240,000 meals, 10,000 media, 80,000 contingency. The scout on 13 September costs 200,000. That is 1,850,000 across two days, so 2,000,000 has to be on hand by 11 September. After the 16th, 100,000 for the first materials payment and 40,000 for lighting. Studio recording of 200,000 falls somewhere in the month.',
  ),
  budgetPendingHeading: t('아직 숫자가 움직일 수 있는 것', 'What can still move'),
  storyHeading: t('시놉시스', 'Synopsis'),
  storySummary: t('곡은 진술, 영상은 증거', 'The song testifies, the picture is evidence'),
  storyLead: t(
    '검은 것을 만지면 붉고 가볍게 만드는 소년이 닻에 묶인 항구마을을 구하고, 같은 손으로 소녀가 건넨 것을 놓칩니다. 곡의 화자는 잘 해보려 했다고 노래하고, 화면은 그가 무엇을 했는지 보여줍니다. 관객은 소년이 보지 못한 것을 보고, 소년보다 먼저 후회합니다.',
    'A boy who turns black things red and weightless frees a harbour village pinned by its anchors, and with the same hand fails to take what the girl offers him. The singer insists he was only trying to help; the picture shows what he actually did. The audience sees what he cannot, and arrives at regret before he does.',
  ),
  storyNote: t(
    '* 아래 문장은 전부 카메라가 기록할 수 있는 것만 적었습니다. 인물의 속마음과 분위기와 의미는 한 줄도 없습니다. 그것들은 빠진 것이 아니라 화면에 있어야 하는 것이라 뺐습니다. 사건은 시간순으로 적었지만 편집 순서는 다릅니다 — 행복한 시절은 후렴에서 처음 등장하고, 같은 촬영본이 두 번째 후렴에서 소녀 쪽으로 크롭되어 다시 나옵니다.',
    '* Every line below is something a camera can record. There is not one line of interior feeling, mood or meaning. They are not missing; they were removed because they belong on screen. The events are listed in story order, but the edit order differs — the happy stretch first appears under the chorus, and the same footage returns under the second chorus, recropped towards the girl.',
  ),
  storyLayerHeading: t('두 개의 층', 'Two layers'),
  storyLayerA: t('기억 · 스톱모션과 손그림 · 과거', 'Memory · stop motion and drawing · past'),
  storyLayerB: t('지금 · 실사 · 현재', 'Now · live action · present'),
  storyLayerNote: t(
    '소년의 몸은 두 층 어디에서나 2D 종이입니다. 마을 사람도 배도 닻도 두께와 그림자를 가졌는데 소년만 얇고 그림자가 생기지 않습니다. 무게를 없애는 자에게 처음부터 무게가 없었다는 뜻이고, 그래서 마지막에 검게 돌아온 돌 하나에 그의 손목이 종이처럼 꺾입니다.',
    'The boy is a flat paper drawing in both layers. The villagers, the boats and the anchors all have volume and cast shadows; he alone is thin and casts none. The one who removes weight never had any, which is why at the end a single stone that has turned black again folds his wrist like paper.',
  ),
  shootHeading: t('동해에서 찍는 것', 'What we shoot on location'),
  shootSummary: t('세팅 네 번 · 필수 다섯 컷', 'Four setups, five essential shots'),
  shootLead: t(
    '컷 수가 아니라 세팅 수가 하루를 먹습니다. 카메라를 세우는 자리는 네 곳뿐이고, 9월 19일 밤과 20일 여명은 같은 자리에서 카메라를 옮기지 않습니다. 오프닝 컷과 추락 착지 컷이 같은 락오프 테이크의 앞뒤여야 하기 때문입니다.',
    'It is the number of setups, not the number of shots, that eats the day. The camera stands in four places only, and it does not move between the night of the 19th and first light on the 20th, because the opening shot and the crash landing must be the head and tail of one locked off take.',
  ),
  shootTableWhen: t('언제', 'When'),
  shootTableShot: t('컷', 'Shot'),
  shootTableOk: t('최소 성공 조건', 'Minimum for success'),
  shootNote: t(
    '* 필수 다섯 컷 중 시간에 묶인 것은 ①②③④이고 ⑤는 아무 때나 찍힙니다. 밤 컷은 어둡기만 하면 되므로 9월 19일 밤 두 시간을 통으로 씁니다. 20일 새벽 23분에 밀어 넣지 않습니다. 비가 오면 ①②⑤는 그대로 찍히고 ③④만 9월 23일 예비일에 다시 찍습니다.',
    '* Of the five essential shots, ① to ④ are tied to a time of day and ⑤ is not. The night shots only need darkness, so they take the whole two hour window on the evening of the 19th rather than being crammed into twenty three minutes before dawn. If it rains, ①, ② and ⑤ still work and only ③ and ④ move to the weather backup on 23 September.',
  ),
  shootPropsHeading: t('소품 전부', 'Every prop'),
  shootProps: t(
    '종이 소년 출력물 (잉크젯 A4 30장, 레이저는 물에 안 번진다) · 드림캐처 실물 1개 · 검은 조약돌 · 초록 바다유리 · 젖은 검은 모래 2~3봉 · 초록 실 · 남자 의상과 예비 상의 · 여자 초록 의상과 리본 · 검은 비닐봉투와 얕은 트레이 · 낚싯줄 0.15mm · 삼각대 자리 표시용 페그 · 마이크 바람막이 · 헤드랜턴',
    'Inkjet printouts of the paper boy (thirty A4 sheets; laser toner will not bleed in water) · one physical dreamcatcher · black pebbles · green sea glass · two or three bags of wet black sand · green thread · the man’s costume plus a spare top · the woman’s green outfit and ribbon · a black bin bag and a shallow tray · 0.15mm fishing line · pegs to mark the tripod position · a microphone windshield · head torches',
  ),
  shootPropsNote: t(
    '* 조약돌 · 바다유리 · 검은 모래는 해변에서 주워 오지 않습니다. 「공유수면 관리 및 매립에 관한 법률」 위반이고 벌칙이 가볍지 않습니다. 흑색 규사 · 원예용 자갈 · 공예용 씨글라스로 9월 16일까지 구매하며, 비용은 의상 · 소품 3만 원 안에 있습니다.',
    '* The pebbles, sea glass and black sand are not collected from the shore. Taking material from public waters is an offence in Korea and the penalty is not small. They are bought instead — silica sand, garden gravel and craft sea glass — by 16 September, inside the 30,000 costume and props line.',
  ),
  shootSoundHeading: t('사운드', 'Sound'),
  shootSound: t(
    '동기화가 필요한 소리가 하나도 없습니다. 대사도 립싱크도 없으므로 전부 후반에 조립합니다. 발소리는 가져온 젖은 모래를 트레이에 깔고 집에서 폴리로 만들고, 파도는 바람이 잔잔한 시간에 현장에서 따로 땁니다. 다만 무엇으로 녹음하든 바람막이는 반드시 챙깁니다 — 바람이 마이크에 직격하면 후반에서 못 살립니다.',
    'Nothing in this film needs to be recorded in sync. There is no dialogue and no lip sync, so the track is assembled afterwards. Footsteps are performed as foley at home over a tray of the sand we bring back; the waves are recorded separately on location whenever the wind drops. Whatever we record with, a windshield is not optional — wind hitting the capsule directly cannot be repaired later.',
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
    '음원과 영상은 따로 달리지만, 9월 9일 곡 길이 잠금과 10월 9일 유통자료 제출에서 반드시 만난다. 본녹음을 촬영 앞에 두어 촬영이 밀려도 음원 트랙은 흔들리지 않게 했다.',
    'Audio and video run separately but must meet twice: when the song length is locked on 9 September and when the assets are delivered on 9 October. Recording sits before the shoot so that a delayed shoot does not disturb the audio track.',
  ),
  trackAudio: t('음원 제작', 'Audio'),
  trackVideo: t('뮤직비디오 제작', 'Music video'),
  legendAudio: t('음원', 'Audio'),
  legendVideo: t('영상', 'Video'),
  legendDecision: t('결정', 'Decision'),
  legendRelease: t('유통 · 공개', 'Release'),
  calFilterAria: t('달력 보기 전환', 'Calendar view'),
  calNote: t(
    '* 10월 23일은 제작자가 제안한 날짜이며 제작팀 의견과 유통사 리드타임을 확인해 함께 확정한다. 이 날짜는 스톱모션 60–90초와 유통사 리드타임 2주를 전제로 한다. 리드타임이 3주 이상이면 10월 30일 이후로 조정한다. 동해 촬영은 9월 20일 일요일을 1순위, 9월 23일 수요일을 기상 예비일로 두며 추석 연휴(9.24–27)는 제외했다.',
    '* 23 October is the date the producer proposes, to be confirmed together once the team has given its view and the distributor lead time is known. It assumes 60 to 90 seconds of stop motion and a two week distributor lead time. If the lead time is three weeks or more, the release moves to 30 October or later. The East Sea shoot is set for Sunday 20 September, with Wednesday 23 September as the weather backup. The Chuseok holiday of 24 to 27 September is excluded.',
  ),
  meetHeading: t('수요일 회의에서 의논할 것', 'What we settle on Wednesday'),
  meetLead: t(
    '완성된 콘티를 가져가는 자리가 아니라, 각자가 무엇을 갖고 무엇을 언제까지 할지 결정하는 자리다. 받아들이기 어려운 것이 있으면 그날 말하는 편이 서로에게 낫다.',
    'This is not a meeting to hand over finished storyboards. It decides what each person keeps and what each person does by when. If something is hard to accept, saying so on the day is better for everyone.',
  ),
  footerDate: t('2026.09.05 기준', 'As of 2026.09.05'),
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

function CalendarMonth({ data, lang, filter }: { data: (typeof calendarMonths)[number]; lang: Lang; filter: TrackFilter }) {
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
          const events = (day ? data.events[day] : undefined)?.filter((event) => inTrack(event, filter));
          return (
            <div key={`${data.month}-${index}`} className={`day-cell${events?.length ? ' has-event' : ''}${data.month === 10 && day === 23 ? ' release-day' : ''}`}>
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

const LANG_KEY = 'lowstar-lang-v2';

// ?lang= 은 그 방문에만 적용하고 저장하지 않는다. 저장은 버튼을 눌렀을 때만 한다.
function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery === 'en' || fromQuery === 'ko') return fromQuery;
  try {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'ko') return stored;
  } catch {
    // 저장소 접근이 막힌 브라우저에서는 기본값을 쓴다
  }
  return 'ko';
}

export default function Home() {
  const [lang, setLang] = useState<Lang>(readInitialLang);
  const [calFilter, setCalFilter] = useState<TrackFilter>('all');

  // 지금 보이는 이벤트가 실제로 쓰는 색만 범례에 살려둔다.
  const liveKinds = useMemo(() => {
    const kinds = new Set<CalendarEvent['kind']>();
    for (const month of calendarMonths) {
      for (const list of Object.values(month.events)) {
        for (const event of list) if (inTrack(event, calFilter)) kinds.add(event.kind);
      }
    }
    return kinds;
  }, [calFilter]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    const next: Lang = lang === 'ko' ? 'en' : 'ko';
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // 저장이 막힌 브라우저에서도 전환 자체는 동작한다
    }
  };

  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label={c.navAria[lang]}>
          <a className="brand" href="#top"><span>LOW STAR</span><small>release plan</small></a>
          <div className="navlinks">
            <a href="#story">{c.navStory[lang]}</a>
            <a href="#shoot">{c.navShoot[lang]}</a>
            <a href="#budget">{c.navBudget[lang]}</a>
            <a href="#rights">{c.navRights[lang]}</a>
            <a href="#roadmap">{c.navRoadmap[lang]}</a>
            <a href="#calendar">{c.navCalendar[lang]}</a>
            <a href="#meeting">{c.navMeeting[lang]}</a>
            <button
              type="button"
              className="lang-toggle"
              onClick={toggleLang}
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
            <strong>2026. 10. 23</strong>
            <span>{c.releaseSub[lang]}</span>
            <div className="release-rule" />
            <dl>
              <div><dt>{c.dlTotal[lang]}</dt><dd>{formatWon(budgetTotal, lang)}</dd></div>
              <div><dt>{c.dlSep[lang]}</dt><dd>{formatWon(2370000, lang)}</dd></div>
              <div><dt>{c.dlCap[lang]}</dt><dd>{formatWon(1500000, lang)}</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      <section className="snapshot" aria-label={c.snapshotAria[lang]}>
        {snapshot.map((s) => (
          <article key={s.n}><span>{s.n}</span><div><b>{s.d}</b><p>{s.label[lang]}</p></div></article>
        ))}
      </section>

      <section className="section-shell" id="story">
        <div className="section-heading">
          <div><p className="eyebrow">SYNOPSIS</p><h2>{c.storyHeading[lang]}</h2></div>
          <p className="budget-heading-total">{c.storySummary[lang]}</p>
        </div>

        <p className="story-lead">{c.storyLead[lang]}</p>

        <div className="layer-strip">
          <article><span>01</span><b>{c.storyLayerA[lang]}</b></article>
          <article><span>02</span><b>{c.storyLayerB[lang]}</b></article>
          <p>{c.storyLayerNote[lang]}</p>
        </div>

        <ol className="story-beats">
          {storyBeats.map((beat) => (
            <li key={beat.n}>
              <span className="beat-number">{beat.n}</span>
              <div><h3>{beat.title[lang]}</h3><p>{beat.body[lang]}</p></div>
            </li>
          ))}
        </ol>
        <p className="budget-condition">{c.storyNote[lang]}</p>
      </section>

      <section className="shoot-section" id="shoot">
        <div className="section-shell">
          <div className="section-heading light-heading">
            <div><p className="eyebrow">EAST SEA · 09.19—09.20</p><h2>{c.shootHeading[lang]}</h2></div>
            <p>{c.shootLead[lang]}</p>
          </div>

          <p className="shoot-summary">{c.shootSummary[lang]}</p>

          <div className="shoot-must">
            {shootMust.map((shot) => (
              <article key={shot.n}>
                <header><i>{shot.n}</i><time>{shot.when[lang]}</time></header>
                <h3>{shot.title[lang]}</h3>
                <p>{shot.body[lang]}</p>
                <small><em>{c.shootTableOk[lang]}</em>{shot.ok[lang]}</small>
              </article>
            ))}
          </div>
          <p className="shoot-note">{c.shootNote[lang]}</p>

          <div className="meeting-columns meeting-three shoot-columns">
            {shootColumns.map((col) => (
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

          <div className="shoot-aside">
            <article><h3>{c.shootPropsHeading[lang]}</h3><p>{c.shootProps[lang]}</p><small>{c.shootPropsNote[lang]}</small></article>
            <article><h3>{c.shootSoundHeading[lang]}</h3><p>{c.shootSound[lang]}</p></article>
          </div>
        </div>
      </section>

      <section className="section-shell" id="budget">
        <div className="section-heading">
          <div><p className="eyebrow">BUDGET</p><h2>{c.budgetHeading[lang]}</h2></div>
          <p className="budget-heading-total">{c.budgetSummary[lang]}</p>
        </div>

        <div className="budget-groups budget-groups-4">
          {budgetGroups.map((group) => (
            <article className={`budget-group budget-${group.key}`} key={group.key}>
              <header>
                <span>{group.number}</span>
                <h3>{group.title[lang]}</h3>
                <strong>{formatWon(group.total, lang)}</strong>
                <em>{group.caption[lang]}</em>
              </header>
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
        <div className="budget-grand-total">
          <span>MONTHLY CAP · 1,500,000원</span>
          <strong>{budgetTotal.toLocaleString('en-US')}원</strong>
        </div>

        <div className="budget-aside">
          <article>
            <h3>{c.budgetWhyHeading[lang]}</h3>
            <p>{c.budgetWhy[lang]}</p>
          </article>
          <article>
            <h3>{c.budgetCreativeHeading[lang]}</h3>
            <p>{c.budgetCreative[lang]}</p>
          </article>
          <article>
            <h3>{c.budgetPendingHeading[lang]}</h3>
            <ul>
              {budgetPending.map(([item, note]) => (
                <li key={item.ko}><b>{item[lang]}</b><small>{note[lang]}</small></li>
              ))}
            </ul>
          </article>
        </div>

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
          <div><p className="eyebrow">MASTER CALENDAR</p><h2>2026. 09 — 10</h2></div>
          <div className="calendar-controls">
            <div className="cal-filter" role="group" aria-label={c.calFilterAria[lang]}>
              {calFilters.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={calFilter === option.key ? 'is-active' : undefined}
                  aria-pressed={calFilter === option.key}
                  onClick={() => setCalFilter(option.key)}
                >
                  {option.label[lang]}
                </button>
              ))}
            </div>
            <div className="legend">
              <span className={liveKinds.has('audio') ? 'event-audio' : 'event-audio is-muted'}>{c.legendAudio[lang]}</span>
              <span className={liveKinds.has('video') ? 'event-video' : 'event-video is-muted'}>{c.legendVideo[lang]}</span>
              <span className={liveKinds.has('decision') ? 'event-decision' : 'event-decision is-muted'}>{c.legendDecision[lang]}</span>
              <span className={liveKinds.has('release') ? 'event-release' : 'event-release is-muted'}>{c.legendRelease[lang]}</span>
            </div>
          </div>
        </div>
        <div className="months">{calendarMonths.map((month) => <CalendarMonth key={month.month} data={month} lang={lang} filter={calFilter} />)}</div>
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
