const budgetGroups = [
  {
    key: 'audio', number: '01', title: '음원 제작', total: 500000,
    rows: [
      ['녹음 프로덕션', 200000],
      ['믹스 · 마스터', 300000],
    ],
  },
  {
    key: 'fee', number: '02', title: '참여 사례비', total: 400000,
    rows: [
      ['기획 · 미술 2명 × 15만 원', 300000],
      ['동해 촬영 참여 1일', 100000],
    ],
  },
  {
    key: 'make', number: '03', title: '제작 · 실비', total: 400000,
    rows: [
      ['스톱모션 · 소품 · 미술 재료', 180000],
      ['조명 · 촬영 세팅', 40000],
      ['동해 이동 · 유류 · 통행 · 주차', 80000],
      ['촬영 · 작업일 식사 · 간식', 70000],
      ['저장 · 백업 매체', 20000],
      ['예비비', 10000],
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
      16: [{ title: '스톱모션 기획안 확정', kind: 'video' }],
      18: [{ title: '콘티 · 로케이션 확정', kind: 'video' }],
      20: [{ title: '세트 · 조명 세팅 완료', kind: 'video' }],
      21: [{ title: '스톱모션 본제작 시작', kind: 'video' }],
      22: [{ title: '동해 촬영 창 시작', kind: 'decision' }],
      30: [{ title: '본녹음 완료', kind: 'audio' }],
    } as Record<number, CalendarEvent[]>,
  },
  {
    name: 'OCTOBER', month: 10, start: 4, days: 31,
    events: {
      6: [{ title: '기상 예비일 · 동해 촬영 종료', kind: 'video' }],
      17: [{ title: '스톱모션 본제작 완료', kind: 'video' }],
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
            <a href="#rights">권리</a>
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
              11주 실행 일정과 제작 계획. 뮤직비디오는 손으로 만드는 스톱모션 애니메이션과
              동해 로케이션 촬영으로 구성한다.
            </p>
          </section>
          <aside className="release-card" aria-label="발매 목표 요약">
            <p>WORKING RELEASE DATE</p>
            <strong>2026. 11. 13</strong>
            <span>FRIDAY · 일정 확정 마감 09.09</span>
            <div className="release-rule" />
            <dl>
              <div><dt>총예산</dt><dd>130만 원</dd></div>
              <div><dt>음원</dt><dd>50만 원</dd></div>
              <div><dt>뮤직비디오</dt><dd>80만 원</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      <section className="snapshot" aria-label="핵심 마일스톤">
        <article><span>01</span><div><b>09.02</b><p>제작팀 킥오프 회의</p></div></article>
        <article><span>02</span><div><b>09.09</b><p>유통사 · 발매일 · 곡 길이 잠금</p></div></article>
        <article><span>03</span><div><b>09.16</b><p>스톱모션 기획안 확정</p></div></article>
        <article><span>04</span><div><b>10.08</b><p>마스터 및 유통자료 제출</p></div></article>
        <article><span>05</span><div><b>11.06</b><p>뮤직비디오 최종본 완성</p></div></article>
      </section>

      <section className="section-shell" id="budget">
        <div className="section-heading">
          <div><p className="eyebrow">BUDGET</p><h2>총예산 130만 원</h2></div>
          <p className="budget-heading-total">음원 50 · 사례비 40 · 제작 40</p>
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
        <div className="budget-grand-total"><span>WORKING BUDGET</span><strong>1,300,000원</strong></div>
        <p className="budget-condition">
          * 동해 촬영은 무박 1일 기준입니다. 재료 · 조명 · 교통 · 식사는 전액 제작자가 부담하며, 참여자가 비용을 먼저 지출하지 않도록 직접 결제 또는 사전 지급합니다.
          재료비는 콘셉트 확정 후와 중간 점검 후 두 차례로 나누어 집행합니다.
        </p>
      </section>


      <section className="section-shell" id="rights">
        <div className="section-heading">
          <div><p className="eyebrow">CREDIT &amp; RIGHTS</p><h2>참여자가 갖는 것</h2></div>
          <p className="budget-heading-total">저작권은 만든 사람에게</p>
        </div>

        <div className="meeting-columns">
          <article>
            <span className="meeting-number">A</span><h3>각자가 갖는 권리</h3>
            <ol>
              <li><b>작업물의 저작권을 그대로 보유</b><small>제작자에게 넘기지 않는다. 제작자는 뮤직비디오에 사용할 권리만 갖는다</small></li>
              <li><b>포트폴리오 · 전시 · 공모전 자유 사용</b><small>별도 동의 절차 없이 자신의 작업을 발표할 수 있다</small></li>
              <li><b>세트 · 소품 실물</b><small>촬영 후 폐기하지 않고 참여자가 전시 등에 활용할 수 있게 보관한다</small></li>
              <li><b>독립 상영본과 원본 파일</b><small>자기 파트만 분리한 영상과 촬영 원본을 전달받는다</small></li>
            </ol>
          </article>
          <article>
            <span className="meeting-number">B</span><h3>제작자가 준비하는 자료</h3>
            <ol>
              <li><b>참여 계약서</b><small>09.02 작성. 역할 · 기간 · 보수 · 권리를 명시하고 양측 날인</small></li>
              <li><b>작품 사진과 제작 과정 기록</b><small>세트 완성 시점에 고화질로 촬영. 나중에 다시 만들 수 없다</small></li>
              <li><b>참여확인서</b><small>공개 후 1개월 이내 발행. 작품명 · 공개일 · 역할 · 기여 분량 · 보수 기재</small></li>
              <li><b>작품 아카이브 페이지</b><small>공개일자와 전체 크레딧이 남는 인용 가능한 URL</small></li>
            </ol>
          </article>
        </div>
        <p className="budget-condition">
          * 크레딧은 영상 엔딩 · 공개 채널 설명란 · 음원 앨범 소개 · 작품 아카이브 페이지 네 곳 모두에 표기하며, 역할명은 각자가 직접 정합니다.
          사례비는 계좌이체로 지급하여 예술활동 수입 증빙이 남도록 합니다.
        </p>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="section-shell">
          <div className="section-heading light-heading">
            <div><p className="eyebrow">11-WEEK ROADMAP</p><h2>두 트랙, 하나의 발매일</h2></div>
            <p>음원과 영상은 따로 달리지만, 9월 9일 곡 길이 잠금과 10월 8일 마스터 제출에서 반드시 만난다. 전체 일정의 병목은 촬영이 아니라 <b>약 4주가 걸리는 스톱모션 본제작</b>이다.</p>
          </div>

          <div className="track-labels"><span>음원 제작</span><span>뮤직비디오 제작</span></div>
          <div className="roadmap-list">
            <article>
              <div className="roadmap-date"><b>08.29</b><span>— 09.02</span></div>
              <div className="roadmap-track audio-track"><i>01</i><h3>준비와 킥오프</h3><p>가사 · 데모 · 레퍼런스 · 예산표 준비</p></div>
              <div className="roadmap-track video-track"><h3>제작팀 첫 회의</h3><p>권리와 크레딧, 예산, 콘셉트, 역할, 촬영 후보일 결정</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>09.03</b><span>— 09.09</span></div>
              <div className="roadmap-track audio-track"><i>02</i><h3>곡 구조 잠금</h3><p>BPM · 구성 · 전체 길이 확정, 촬영용 플레이백 제작</p></div>
              <div className="roadmap-track video-track"><h3>기획 잠금</h3><p>한 문장 메시지, 필수 장면, 스톱모션 분량과 기법 방향</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>09.10</b><span>— 09.16</span></div>
              <div className="roadmap-track audio-track"><i>03</i><h3>가녹음</h3><p>가녹음 · 가믹스로 편집용 플레이백 확보</p></div>
              <div className="roadmap-track video-track"><h3>스톱모션 기획안 확정</h3><p>기법 · 분량 · 프레임레이트 · 작업 공간 · 재료 목록 결정</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>09.17</b><span>— 09.20</span></div>
              <div className="roadmap-track audio-track"><i>04</i><h3>본녹음</h3><p>보컬 · 악기 녹음과 편집</p></div>
              <div className="roadmap-track video-track"><h3>세트 제작 · 조명 세팅</h3><p>재료 구입, 미니어처 제작, 카메라 고정과 수동 노출 고정</p></div>
            </article>
            <article className="long-span">
              <div className="roadmap-date"><b>09.21</b><span>— 10.17</span></div>
              <div className="roadmap-track audio-track"><i>05</i><h3>믹스 · 마스터</h3><p>10.08 커버 · 소개글 · 크레디트와 함께 유통자료 제출</p></div>
              <div className="roadmap-track video-track"><h3>스톱모션 본제작 (최장 구간)</h3><p>프레임 촬영 · 드로잉 애니메이션. 동해 촬영 무박 1일을 이 기간에 끼워 넣는다</p></div>
            </article>
            <article>
              <div className="roadmap-date"><b>10.18</b><span>— 11.06</span></div>
              <div className="roadmap-track audio-track"><i>06</i><h3>발매 사전 세팅</h3><p>플랫폼 등록 확인, 소개문, 피칭, 티저 준비</p></div>
              <div className="roadmap-track video-track"><h3>후반작업</h3><p>러프컷 V1 → 피드백 V2 → 픽처락 → 색보정 · 독립 상영본 추출</p></div>
            </article>
            <article className="final-roadmap">
              <div className="roadmap-date"><b>11.07</b><span>— 11.13</span></div>
              <div className="roadmap-track audio-track"><i>07</i><h3>공개 준비</h3><p>프리세이브 · 채널 정리 · 링크와 게시물 예약</p></div>
              <div className="roadmap-track video-track"><h3>동시 공개</h3><p>11월 13일 음원과 뮤직비디오 공개 · 크레딧과 참여확인서 발행</p></div>
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
        <p className="calendar-note">* 이 일정의 병목은 촬영이 아니라 9월 21일부터 10월 17일까지 약 4주간 이어지는 스톱모션 본제작이다. 동해 촬영은 그 기간 안에 무박 1일로 넣는다. 촬영일 1 · 2순위와 기상 예비일은 9월 2일 회의에서 확정하며, 9월 24–27일과 10월 3–5일 공식 연휴는 촬영 창에서 제외했다.</p>
      </section>

      <section className="meeting-section" id="meeting">
        <div className="meeting-title">
          <p className="eyebrow">KICKOFF · 2026.09.02</p>
          <h2>수요일 회의에서<br />반드시 끝낼 것</h2>
          <p>완성된 콘티를 가져가는 자리가 아니라, 각자가 무엇을 갖고 무엇을 언제까지 할지 결정하는 자리다.</p>
        </div>
        <div className="meeting-columns">
          <article>
            <span className="meeting-number">A</span><h3>가져갈 자료</h3>
            <ol>
              <li><b>권리 안내문</b><small>각자가 갖는 권리, 제작자가 준비할 자료, 예술활동증명</small></li>
              <li><b>안건표</b><small>순서와 시간이 정해진 진행표</small></li>
              <li><b>예산 확정안 130만 원</b><small>항목별 상한과 실비 정산 방식</small></li>
              <li><b>참여 계약서</b><small>1인당 2부. 그 자리에서 작성하고 날인</small></li>
              <li><b>데모와 레퍼런스</b><small>곡, 스톱모션 톤, 동해 로케이션 후보</small></li>
            </ol>
          </article>
          <article>
            <span className="meeting-number">B</span><h3>그날 결정할 것</h3>
            <ol>
              <li><b>크레딧 이름과 역할명</b><small>각자 직접 정한다. 모호한 표기는 쓰지 않는다</small></li>
              <li><b>콘셉트와 동해 필수 컷</b><small>없으면 성립하지 않는 컷이 무엇인지</small></li>
              <li><b>동해 촬영일과 예비일</b><small>1 · 2순위, 현장 인원, 차량, 집합 시간</small></li>
              <li><b>스톱모션 기획안 마감일</b><small>09.16 목표. 분량과 기법, 작업 공간</small></li>
              <li><b>계약 체결과 정산 방식</b><small>사례비 지급 시기, 재료비 집행 순서</small></li>
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
