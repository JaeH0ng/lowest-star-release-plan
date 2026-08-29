const budgetGroups = [
  {
    key: 'audio', number: '01', title: '음원 제작', total: 500000,
    rows: [
      ['녹음 프로덕션', 200000],
      ['믹스 · 마스터', 300000],
    ],
  },
  {
    key: 'art', number: '02', title: '뮤비 기획 · 미술', total: 390000,
    rows: [
      ['기획 · 미술 메인 2명 × 15만 원', 300000],
      ['세트 · 소품 · 미술 재료', 70000],
      ['의상 · 소모품', 20000],
    ],
  },
  {
    key: 'shoot', number: '03', title: '촬영 · 후반 · 제작', total: 610000,
    rows: [
      ['촬영 · 편집 메인 1명 × 15만 원', 150000],
      ['렌즈 · 조명 등 장비 대여', 80000],
      ['동해 이동 · 유류 · 통행 · 주차', 100000],
      ['촬영 식사 · 간식', 70000],
      ['저장 · 백업 매체', 20000],
      ['추가 보조 인력 풀', 100000],
      ['예비비', 90000],
    ],
  },
] as const;

const formatWon = (value: number) => `${(value / 10000).toLocaleString('ko-KR')}만 원`;

type CalendarEvent = { title: string; kind: 'audio' | 'video' | 'release' | 'decision' };

const calendarMonths = [
  {
    name: 'SEPTEMBER', month: 9, start: 2, days: 30,
    events: {
      2: [{ title: '제작팀 킥오프', kind: 'decision' }],
      4: [{ title: '유통사 3곳 문의', kind: 'release' }],
      9: [{ title: '발매일 · 곡 길이 잠금', kind: 'decision' }],
      13: [{ title: '가녹음 · 가믹스', kind: 'audio' }],
      18: [{ title: '콘티 · 로케이션 확정', kind: 'video' }],
      20: [{ title: '촬영 준비 완료', kind: 'video' }],
      21: [{ title: '본촬영 창 시작 · 본녹음', kind: 'decision' }],
      30: [{ title: '본녹음 완료', kind: 'audio' }],
    } as Record<number, CalendarEvent[]>,
  },
  {
    name: 'OCTOBER', month: 10, start: 4, days: 31,
    events: {
      6: [{ title: '기상 예비일 · 촬영창 종료', kind: 'video' }],
      8: [{ title: '마스터 · 유통자료 제출', kind: 'decision' }],
      18: [{ title: '러프컷 V1', kind: 'video' }],
      25: [{ title: '피드백 V2', kind: 'video' }],
      30: [{ title: '플랫폼 피칭 · 홍보', kind: 'release' }],
    } as Record<number, CalendarEvent[]>,
  },
  {
    name: 'NOVEMBER', month: 11, start: 0, days: 30,
    events: {
      1: [{ title: '픽처락 · 색보정', kind: 'video' }],
      6: [{ title: '뮤직비디오 최종본', kind: 'decision' }],
      7: [{ title: '업로드 · 티저 시작', kind: 'release' }],
      13: [{ title: '음원 · MV 공개', kind: 'release' }],
    } as Record<number, CalendarEvent[]>,
  },
] as const;

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function CalendarMonth({ data }: { data: (typeof calendarMonths)[number] }) {
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - data.start + 1;
    return day > 0 && day <= data.days ? day : null;
  });

  return (
    <article className="month-card">
      <header><span>2026</span><h3>{data.month}월</h3><b>{data.name}</b></header>
      <div className="weekday-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          const events = day ? data.events[day] : undefined;
          return (
            <div key={`${data.month}-${index}`} className={`day-cell${events ? ' has-event' : ''}${data.month === 11 && day === 13 ? ' release-day' : ''}`}>
              {day && <span className="day-number">{day}</span>}
              {events?.map((event) => <small key={event.title} className={`event-${event.kind}`}>{event.title}</small>)}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label="페이지 탐색">
          <a className="brand" href="#top"><span>LOW STAR</span><small>release plan</small></a>
          <div className="navlinks">
            <a href="#budget">예산</a>
            <a href="#roadmap">로드맵</a>
            <a href="#calendar">캘린더</a>
            <a href="#meeting">회의</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section>
            <p className="eyebrow">SINGLE &amp; MUSIC VIDEO · WORKING PLAN</p>
            <h1>가장 낮은 별<br /><em>발매 프로젝트</em></h1>
            <p className="hero-copy">
              작사·작곡을 마친 한 곡을 음원과 뮤직비디오로 완성해 세상에 내놓기 위한
              11주 실행 일정과 제작 계획.
            </p>
          </section>
          <aside className="release-card" aria-label="발매 목표 요약">
            <p>WORKING RELEASE DATE</p>
            <strong>2026. 11. 13</strong>
            <span>FRIDAY · 일정 확정 마감 09.09</span>
            <div className="release-rule" />
            <dl>
              <div><dt>총예산</dt><dd>150만 원</dd></div>
              <div><dt>음원</dt><dd>50만 원</dd></div>
              <div><dt>뮤직비디오</dt><dd>100만 원</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      <section className="snapshot" aria-label="핵심 마일스톤">
        <article><span>01</span><div><b>09.02</b><p>제작팀 킥오프 회의</p></div></article>
        <article><span>02</span><div><b>09.09</b><p>유통사 · 발매일 · 곡 길이 잠금</p></div></article>
        <article><span>03</span><div><b>10.08</b><p>마스터 및 유통자료 제출</p></div></article>
        <article><span>04</span><div><b>11.06</b><p>뮤직비디오 최종본 완성</p></div></article>
      </section>

      <section className="section-shell" id="budget">
        <div className="section-heading">
          <div><p className="eyebrow">BUDGET</p><h2>총예산 150만 원</h2></div>
          <p className="budget-heading-total">음원 50 · 기획/미술 39 · 촬영/후반 61</p>
        </div>

        <div className="budget-groups">
          {budgetGroups.map((group) => (
            <article className={`budget-group budget-${group.key}`} key={group.key}>
              <header><span>{group.number}</span><h3>{group.title}</h3><strong>{formatWon(group.total)}</strong></header>
              <table>
                <thead><tr><th>항목</th><th>금액</th></tr></thead>
                <tbody>
                  {group.rows.map(([item, amount]) => (
                    <tr key={item}><td>{item}</td><td>{formatWon(amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
        <div className="budget-grand-total"><span>WORKING BUDGET</span><strong>1,500,000원</strong></div>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="section-shell">
          <div className="section-heading light-heading">
            <div><p className="eyebrow">11-WEEK ROADMAP</p><h2>두 트랙, 하나의 발매일</h2></div>
            <p>음원과 영상은 따로 달리지만, 9월 9일 곡 길이 잠금과 10월 8일 마스터 제출에서 반드시 만난다.</p>
          </div>

          <div className="track-labels"><span>음원 제작</span><span>뮤직비디오 제작</span></div>
          <div className="roadmap-list">
            <article>
              <div className="roadmap-date"><b>08.29</b><span>— 09.02</span></div>
              <div className="roadmap-track audio-track"><i>01</i><h3>준비와 킥오프</h3><p>가사 · 데모 · 레퍼런스 · 예산표 준비</p></div>
              <div className="roadmap-track video-track"><h3>제작팀 첫 회의</h3><p>콘셉트, 역할, 촬영 범위, 후보일 결정</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>09.03</b><span>— 09.09</span></div>
              <div className="roadmap-track audio-track"><i>02</i><h3>곡 구조 잠금</h3><p>BPM · 구성 · 전체 길이 확정, 촬영용 플레이백 제작</p></div>
              <div className="roadmap-track video-track"><h3>기획 잠금</h3><p>한 문장 메시지, 필수 장면, 유통사와 발매 가안 확정</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>09.10</b><span>— 09.30</span></div>
              <div className="roadmap-track audio-track"><i>03</i><h3>녹음</h3><p>가녹음 · 가믹스 · 본녹음 · 보컬 편집 완료</p></div>
              <div className="roadmap-track video-track"><h3>프리프로덕션</h3><p>콘티, 로케이션, 소품, 의상, 장비, 콜시트 준비</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>09.21</b><span>— 10.06</span></div>
              <div className="roadmap-track audio-track"><i>04</i><h3>마스터 준비</h3><p>녹음 파일 정리 및 믹스 엔지니어 전달</p></div>
              <div className="roadmap-track video-track"><h3>본촬영</h3><p>세트 · 퍼포먼스 1일 + 동해 촬영 1일. 추석 · 개천절 연휴 제외</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>10.01</b><span>— 10.08</span></div>
              <div className="roadmap-track audio-track"><i>05</i><h3>믹스 · 마스터</h3><p>커버, 소개글, 크레디트와 함께 유통자료 제출</p></div>
              <div className="roadmap-track video-track"><h3>데이터 정리</h3><p>백업 2벌, 싱크 확인, 편집 프로젝트 인계</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>10.05</b><span>— 11.06</span></div>
              <div className="roadmap-track audio-track"><i>06</i><h3>발매 사전 세팅</h3><p>플랫폼 등록 확인, 소개문, 피칭, 티저 준비</p></div>
              <div className="roadmap-track video-track"><h3>후반작업</h3><p>러프컷 V1 → 피드백 V2 → 픽처락 → 색보정 · 자막</p></div>
            </article>
            <article className="final-roadmap">
              <div className="roadmap-date"><b>11.07</b><span>— 11.13</span></div>
              <div className="roadmap-track audio-track"><i>07</i><h3>공개 준비</h3><p>프리세이브 · 채널 정리 · 링크와 게시물 예약</p></div>
              <div className="roadmap-track video-track"><h3>동시 공개</h3><p>11월 13일 음원과 공식 뮤직비디오 공개</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="calendar-section" id="calendar">
        <div className="calendar-heading">
          <div><p className="eyebrow">MASTER CALENDAR</p><h2>2026. 09 — 11</h2></div>
          <div className="legend"><span className="event-audio">음원</span><span className="event-video">영상</span><span className="event-decision">결정</span><span className="event-release">유통 · 공개</span></div>
        </div>
        <div className="months">{calendarMonths.map((month) => <CalendarMonth key={month.month} data={month} />)}</div>
        <p className="calendar-note">* 본촬영 2일과 기상 예비일은 9월 2일 회의에서 확정한다. 9월 24–27일과 10월 3–5일 공식 연휴는 촬영 창에서 제외했다.</p>
      </section>

      <section className="meeting-section" id="meeting">
        <div className="meeting-title">
          <p className="eyebrow">KICKOFF · 2026.09.02</p>
          <h2>수요일 회의에서<br />반드시 끝낼 것</h2>
          <p>완성된 콘티를 가져가는 자리가 아니라, 누가 무엇을 언제까지 할지 결정하는 자리다.</p>
        </div>
        <div className="meeting-columns">
          <article>
            <span className="meeting-number">A</span><h3>가져갈 자료</h3>
            <ol>
              <li><b>가사와 데모</b><small>가능하면 최종 길이에 가까운 버전</small></li>
              <li><b>한 문장 영상 방향</b><small>추락한 소년이 왜 날았는지 노래한다</small></li>
              <li><b>레퍼런스 6–10장</b><small>동해, 검은 물가, 낮은 별, 손으로 만든 세트</small></li>
              <li><b>예산 상한표</b><small>장비 · 재료 · 사례비 · 보조 인력 · 예비비</small></li>
              <li><b>촬영 후보일</b><small>주촬영 2일과 기상 예비일</small></li>
            </ol>
          </article>
          <article>
            <span className="meeting-number">B</span><h3>그날 결정할 것</h3>
            <ol>
              <li><b>콘셉트와 필수 장면 3개</b><small>동해 · 수제 세트 · 기타 퍼포먼스</small></li>
              <li><b>역할과 최종 결정권</b><small>연출, 촬영, 미술, 제작 진행, 편집</small></li>
              <li><b>촬영일과 예비일</b><small>이동 · 일몰 · 날씨까지 고려</small></li>
              <li><b>자료 공유 방식</b><small>파일명 · 버전 · 전달 채널 통일</small></li>
              <li><b>후반작업 규칙</b><small>러프컷 날짜와 수정 2회까지</small></li>
            </ol>
          </article>
        </div>
      </section>

      <footer>
        <div><span>LOW STAR · RELEASE PLAN</span><b>2026.08.29 기준</b></div>
        <p>발매일과 촬영 후보일은 제작팀 및 유통사 협의 전 가안입니다.</p>
      </footer>
    </main>
  );
}
