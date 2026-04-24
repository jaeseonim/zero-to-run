/* ====================================================
   app.js — 첫 발걸음 런닝 앱
   기술 스택: Vanilla JavaScript + localStorage
   ==================================================== */


/* ====================================================
   ① 설정값 모음 (여기만 수정하면 됩니다)
   ==================================================== */

// 앱 이름 (localStorage 키 접두어)
const APP_KEY = 'firststep';

// 7일 커리큘럼 정의
// type: 'workout' | 'rest'
// phases: 운동 구간 배열 (순서대로 실행됨)
//   - label: 화면에 표시할 이름
//   - type: 'warmup' | 'jog' | 'walk' | 'cooldown'
//   - duration: 초 단위 (분×60)
const CURRICULUM = [
  {
    day: 1,
    title: '첫 걸음',
    type: 'workout',
    phases: [
      { label: '워밍업',  type: 'warmup',   duration: 3 * 60 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '쿨다운',  type: 'cooldown', duration: 3 * 60 },
    ],
  },
  {
    day: 2,
    title: '두 번째 발걸음',
    type: 'workout',
    phases: [
      { label: '워밍업',  type: 'warmup',   duration: 3 * 60 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '쿨다운',  type: 'cooldown', duration: 3 * 60 },
    ],
  },
  {
    day: 3,
    title: '조금 더 길게',
    type: 'workout',
    phases: [
      { label: '워밍업',  type: 'warmup',   duration: 3 * 60 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '쿨다운',  type: 'cooldown', duration: 3 * 60 },
    ],
  },
  {
    day: 4,
    title: '회복의 날',
    type: 'rest',   // ← 회복일은 타이머 없이 별도 화면
  },
  {
    day: 5,
    title: '강도 업',
    type: 'workout',
    phases: [
      { label: '워밍업',  type: 'warmup',   duration: 3 * 60 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '조깅',    type: 'jog',      duration: 90 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '쿨다운',  type: 'cooldown', duration: 3 * 60 },
    ],
  },
  {
    day: 6,
    title: '더 길게 뛰기',
    type: 'workout',
    phases: [
      { label: '워밍업',  type: 'warmup',   duration: 3 * 60 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 60 },
      { label: '쿨다운',  type: 'cooldown', duration: 3 * 60 },
    ],
  },
  {
    day: 7,
    title: '마지막 한 바퀴',
    type: 'workout',
    phases: [
      { label: '워밍업',  type: 'warmup',   duration: 3 * 60 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '조깅',    type: 'jog',      duration: 2 * 60 },
      { label: '걷기',    type: 'walk',     duration: 90 },
      { label: '쿨다운',  type: 'cooldown', duration: 3 * 60 },
    ],
  },
];

// 일차별 명언
const QUOTES = [
  { text: "우사인볼트가 세계에서 왜 제일 달리기 빠른 사람인지 알아요? 끝까지 갔기 때문이예요.", author: "Swings" },
  { text: "늦었다고 생각할 때가 진짜 너무 늦었다. 그러니 지금 당장 시작해라.", author: "박명수" },
  { text: "인간에게는 한계가 없다.", author: "엘리우드 킵초게" },
  { text: "운동은 끝나고 먹는 것까지가 운동이다.", author: "김종국" },
  { text: "동기부여가 당신을 시작하게 한다면, 습관은 당신을 계속 나아가게 만든다.", author: "짐 런" },
  { text: "고통은 피할 수 없지만, 괴로워할지 말지는 본인의 선택이다.", author: "무라카미 하루키" },
  { text: "나는 9초를 달리기 위해 4년을 훈련했다. 사람들은 2달 해보고 결과가 안 나온다고 포기한다.", author: "우사인 볼트" },
];

// 구간 타입별 색상 (CSS 클래스와 대응)
const PHASE_CHIP_CLASS = {
  warmup:   'chip-warmup',
  jog:      'chip-jog',
  walk:     'chip-walk',
  cooldown: 'chip-cooldown',
};

// 구간 타입별 화면 레이블 텍스트
const PHASE_LABELS = {
  warmup:   '워밍업 — 천천히 준비해요',
  jog:      '조깅 — 편하게 달려요',
  walk:     '걷기 — 숨 고르기',
  cooldown: '쿨다운 — 마무리 스트레칭',
};


// 타이머 화면에 오늘 명언 표시
function showQuote(day) {
  const quote = QUOTES[day - 1];
  if (!quote) return;
  document.getElementById('quote-text').textContent   = `"${quote.text}"`;
  document.getElementById('quote-author').textContent = `— ${quote.author}`;
}


/* ====================================================
   ② 테마 (라이트 / 다크 / 자동)
   ==================================================== */

const THEME_KEY = APP_KEY + '_theme';

// 테마 적용: 'light' | 'dark'
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('btn-theme');
  if (btn) {
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    btn.title = theme === 'dark' ? '다크 모드 (탭해서 라이트로)' : '라이트 모드 (탭해서 다크로)';
  }
  localStorage.setItem(THEME_KEY, theme);
}

// 버튼 클릭 시 토글: 라이트 ↔ 다크
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');
}

// 저장된 테마 즉시 적용 (기본값: 라이트)
applyTheme(localStorage.getItem(THEME_KEY) || 'light');


/* ====================================================
   ③ 운동 진행 상태 저장/복원 (새로고침 대비)
   ==================================================== */

const WORKOUT_KEY = APP_KEY + '_workout';

// 현재 구간 인덱스를 localStorage에 저장 (구간이 바뀔 때마다 호출)
function saveWorkoutProgress(day, phaseIdx) {
  const today = new Date().toISOString().slice(0, 10); // "2026-04-24"
  localStorage.setItem(WORKOUT_KEY, JSON.stringify({ day, phaseIdx, date: today }));
}

// 운동 완료 또는 나가기 시 저장값 삭제
function clearWorkoutProgress() {
  localStorage.removeItem(WORKOUT_KEY);
}

// 저장된 진행값 불러오기 (오늘 날짜 것만 유효)
function loadWorkoutProgress() {
  const saved = localStorage.getItem(WORKOUT_KEY);
  if (!saved) return null;
  const data = JSON.parse(saved);
  const today = new Date().toISOString().slice(0, 10);
  if (data.date !== today) {
    clearWorkoutProgress(); // 날짜 다르면 버림
    return null;
  }
  return data;
}


/* ====================================================
   ③ 앱 상태 (메모리 + localStorage 동기화)
   ==================================================== */

// localStorage에서 불러오기. 없으면 초기값으로 세팅.
function loadState() {
  const saved = localStorage.getItem(APP_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // 처음 실행 시 초기 상태
  return {
    currentDay: 1,          // 현재 진행 중인 일차 (1~7)
    completedDays: [],       // 완료한 일차 배열 (예: [1, 2, 3])
  };
}

// 상태를 localStorage에 저장
function saveState(state) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

// 전역 상태
let STATE = loadState();


/* ====================================================
   ④ 화면 꺼짐 방지 (Wake Lock)
   ==================================================== */
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {
    // 지원하지 않거나 권한 없을 때 조용히 무시
    console.log('Wake Lock 사용 불가:', err);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

// 앱으로 다시 돌아왔을 때 Wake Lock 자동 재요청
document.addEventListener('visibilitychange', async () => {
  if (wakeLock === null && document.visibilityState === 'visible') {
    // 타이머가 실행 중일 때만 재요청
    if (timerInterval !== null) {
      await requestWakeLock();
    }
  }
});


/* ====================================================
   ④ 타이머 전역 변수
   ==================================================== */
let timerInterval   = null;   // setInterval 핸들러
let currentPhaseIdx = 0;      // 현재 구간 인덱스
let remainingSec    = 0;      // 현재 구간 남은 초
let totalElapsed    = 0;      // 전체 경과 초
let totalDuration   = 0;      // 전체 운동 시간(초)
let currentPhases   = [];     // 현재 운동의 구간 배열


/* ====================================================
   ④ 화면 전환 헬퍼
   ==================================================== */

// 특정 화면만 보이게 전환
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


/* ====================================================
   ⑤ 홈 화면 렌더링
   ==================================================== */

function renderHome() {
  showScreen('screen-home');

  const day     = STATE.currentDay;
  const done    = STATE.completedDays;
  const todayDone = done.includes(day);

  // 트랙 중앙 숫자 업데이트
  document.getElementById('track-day-num').textContent = day;

  // 운동장 트랙 그리기
  drawTrack(day, done);

  // 오늘 카드 vs 완료 카드 분기
  if (todayDone) {
    document.getElementById('today-card').classList.add('hidden');
    document.getElementById('done-card').classList.remove('hidden');

    // 다음날 안내 메시지
    const nextMsg = day >= 7
      ? '7일 완주를 축하해요! 🎉'
      : `내일은 ${day + 1}일차에요`;
    document.getElementById('done-next').textContent = nextMsg;

  } else {
    document.getElementById('today-card').classList.remove('hidden');
    document.getElementById('done-card').classList.add('hidden');

    const plan = CURRICULUM[day - 1];  // 배열은 0부터 시작하므로 -1

    // 오늘 카드 정보 채우기
    document.getElementById('today-title').textContent = `${day}일차 — ${plan.title}`;

    if (plan.type === 'rest') {
      document.getElementById('today-meta').textContent = '오늘은 회복일이에요 🌿\n가벼운 산책 15~20분';
      document.getElementById('btn-start').textContent = '회복일 보기 →';
    } else {
      document.getElementById('today-meta').textContent = buildWorkoutMeta(plan);
      document.getElementById('btn-start').textContent = '시작하기 →';
    }
  }
}

// 운동장 트랙 SVG 그리기
function drawTrack(currentDay, completedDays) {
  const svg    = document.getElementById('track-svg');
  const dotsG  = document.getElementById('track-dots');
  const progressEl = document.getElementById('track-progress');

  // 타원 둘레 계산 (근사값: π × (3(a+b) - √((3a+b)(a+3b))))
  const a = 130, b = 110;
  const perimeter = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));

  // 완료된 날만큼 원호 길이 계산
  const completedCount = completedDays.length;
  const arcLen = (completedCount / 7) * perimeter;
  progressEl.setAttribute('stroke-dasharray', `${arcLen} 9999`);

  // 기존 점 초기화
  dotsG.innerHTML = '';

  // 7개 점을 타원 위에 균등 배치
  // 각도: -90도(위)부터 시작해서 360/7씩 증가
  for (let i = 0; i < 7; i++) {
    const angleDeg = -90 + (360 / 7) * i;
    const angleRad = (angleDeg * Math.PI) / 180;

    // 타원 위의 좌표 계산 (중심 160, 160)
    const x = 160 + a * Math.cos(angleRad);
    const y = 160 + b * Math.sin(angleRad);

    const dayNum  = i + 1;
    const isDone  = completedDays.includes(dayNum);
    const isToday = dayNum === currentDay && !isDone;

    // 상태에 따른 스타일 결정
    const circleClass = isDone ? 'dot-done' : (isToday ? 'dot-today' : 'dot-future');
    const labelClass  = isDone ? 'dot-label-done' : (isToday ? 'dot-label-today' : 'dot-label-future');
    const r = isToday ? 20 : 16;  // 오늘은 조금 더 크게

    // 원과 텍스트를 그룹으로 묶어서 클릭 이벤트 달기
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('style', 'cursor: pointer;');
    group.addEventListener('click', () => showDayCard(dayNum));

    // 원 추가
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toFixed(1));
    circle.setAttribute('cy', y.toFixed(1));
    circle.setAttribute('r', r);
    circle.setAttribute('class', circleClass);
    group.appendChild(circle);

    // 숫자 레이블 추가
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toFixed(1));
    text.setAttribute('y', (y + 4).toFixed(1));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', labelClass);
    text.setAttribute('font-weight', isToday ? '700' : '400');
    text.textContent = isDone ? '✓' : dayNum;
    group.appendChild(text);

    dotsG.appendChild(group);
  }
}

// 날짜 점 클릭 시 해당 일차 정보를 카드에 표시
function showDayCard(dayNum) {
  const plan     = CURRICULUM[dayNum - 1];
  const isDone   = STATE.completedDays.includes(dayNum);
  const isToday  = dayNum === STATE.currentDay && !isDone;
  const isLocked = dayNum > STATE.currentDay; // 아직 안 열린 날

  // 완료 카드 숨기고 오늘 카드 보이기
  document.getElementById('done-card').classList.add('hidden');
  document.getElementById('today-card').classList.remove('hidden');

  // 제목
  const statusEmoji = isDone ? '✓ ' : (isLocked ? '🔒 ' : '');
  document.getElementById('today-title').textContent =
    `${statusEmoji}${dayNum}일차 — ${plan.title}`;

  // 메타 정보
  if (plan.type === 'rest') {
    document.getElementById('today-meta').textContent = '회복일 🌿\n가벼운 산책 15~20분';
  } else {
    document.getElementById('today-meta').textContent = buildWorkoutMeta(plan);
  }

  // 버튼 처리
  const btn = document.getElementById('btn-start');
  if (isDone) {
    btn.textContent = '완료한 날이에요 ✓';
    btn.disabled = true;
    btn.style.opacity = '0.4';
  } else if (isLocked) {
    btn.textContent = `${STATE.currentDay}일차를 먼저 완료해야 해요`;
    btn.disabled = true;
    btn.style.opacity = '0.4';
  } else {
    // 오늘 (시작 가능)
    btn.textContent = plan.type === 'rest' ? '회복일 보기 →' : '시작하기 →';
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// 구간 배열의 총 초 계산 (오늘 카드 메타 정보에 사용)
function totalSeconds(phases) {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

// 초 → 읽기 쉬운 시간 포맷 (예: 60→"1분", 90→"1분 30초", 45→"45초")
function fmtSec(sec) {
  if (sec < 60) return `${sec}초`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}분` : `${m}분 ${s}초`;
}

// 운동 메타 텍스트 생성 (홈 카드 + 날짜 점 클릭 공통 사용)
function buildWorkoutMeta(plan) {
  const mins     = Math.round(totalSeconds(plan.phases) / 60);
  const jogCount = plan.phases.filter(p => p.type === 'jog').length;
  const jogSec   = plan.phases.find(p => p.type === 'jog')?.duration || 0;
  const walkSec  = plan.phases.find(p => p.type === 'walk')?.duration || 0;
  return `총 ${mins}분 · ${jogCount}세트 (조깅 ${fmtSec(jogSec)} + 걷기 ${fmtSec(walkSec)})`;
}


/* ====================================================
   ⑥ 운동 시작
   ==================================================== */

function startWorkout() {
  const plan = CURRICULUM[STATE.currentDay - 1];

  // 회복일이면 회복 화면으로 분기
  if (plan.type === 'rest') {
    showScreen('screen-rest');
    return;
  }

  // 타이머 변수 초기화
  currentPhases   = plan.phases;
  currentPhaseIdx = 0;
  totalElapsed    = 0;
  totalDuration   = totalSeconds(currentPhases);
  remainingSec    = currentPhases[0].duration;

  // 진행 상태 저장 시작
  saveWorkoutProgress(STATE.currentDay, 0);

  // 타이머 화면 초기 렌더링
  renderTimerScreen();
  showQuote(STATE.currentDay);
  showScreen('screen-timer');

  // 화면 꺼짐 방지
  requestWakeLock();

  // 1초마다 tick
  timerInterval = setInterval(tick, 1000);
}


/* ====================================================
   ⑦ 타이머 화면 렌더링
   ==================================================== */

function renderTimerScreen() {
  const phase = currentPhases[currentPhaseIdx];

  // 상단 레이블
  document.getElementById('phase-label').textContent = phase.label;
  document.getElementById('phase-desc').textContent  = PHASE_LABELS[phase.type] || '';

  // 구간 색상에 따라 레이블 색상 변경
  // 힌트: 색을 바꾸고 싶으면 아래 색상 코드를 수정하세요
  const colors = { warmup: '#e8c97a', jog: '#d4845a', walk: '#6aaa8c', cooldown: '#e8c97a' };
  document.getElementById('phase-label').style.color = colors[phase.type] || '#888';

  // 구간 미니맵 그리기 (처음 한 번만)
  if (document.getElementById('phase-map').children.length === 0) {
    buildPhaseMap();
  }
  updatePhaseMap();

  // 타이머 숫자 업데이트
  updateTimerDisplay(remainingSec);

  // 전체 진행 바
  const pct = (totalElapsed / totalDuration) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('total-time-label').textContent =
    `총 ${Math.round(totalDuration / 60)}분`;

  // 마지막 구간 완료 버튼
  const isLast = currentPhaseIdx === currentPhases.length - 1 && remainingSec <= 0;
  document.getElementById('btn-finish').classList.toggle('hidden', !isLast);
}

// 구간 미니맵 칩 생성
function buildPhaseMap() {
  const map = document.getElementById('phase-map');
  map.innerHTML = '';
  currentPhases.forEach((p, i) => {
    const chip = document.createElement('div');
    chip.className = `phase-chip ${PHASE_CHIP_CLASS[p.type] || ''}`;
    chip.id = `chip-${i}`;
    // 칩 너비를 구간 길이에 비례하게 (시각적 표현)
    // 최대 60px, 최소 16px 사이에서 비례
    const ratio = p.duration / totalDuration;
    chip.style.flex = ratio * 10;
    map.appendChild(chip);
  });
}

// 현재 구간 강조
function updatePhaseMap() {
  currentPhases.forEach((_, i) => {
    const chip = document.getElementById(`chip-${i}`);
    if (!chip) return;
    chip.classList.remove('active', 'done');
    if (i < currentPhaseIdx)      chip.classList.add('done');
    else if (i === currentPhaseIdx) chip.classList.add('active');
  });
}

// 타이머 숫자 포맷팅 (초 → MM:SS)
function updateTimerDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  document.getElementById('timer-min').textContent = String(m).padStart(2, '0');
  document.getElementById('timer-sec').textContent = String(s).padStart(2, '0');
}


/* ====================================================
   ⑧ 타이머 틱 (매초 호출)
   ==================================================== */

function tick() {
  remainingSec--;
  totalElapsed++;

  // 현재 구간 남은 시간이 0이 되면 다음 구간으로
  if (remainingSec <= 0) {
    currentPhaseIdx++;

    // 모든 구간 완료 → 완료 버튼 표시
    if (currentPhaseIdx >= currentPhases.length) {
      clearInterval(timerInterval);
      currentPhaseIdx = currentPhases.length - 1; // 인덱스 초과 방지
      remainingSec = 0;
      renderTimerScreen();
      document.getElementById('btn-finish').classList.remove('hidden');

      // 진동 알림 (지원하는 기기에서)
      vibrate([200, 100, 200]);
      return;
    }

    // 다음 구간 시작 알림 진동
    vibrate([100]);
    remainingSec = currentPhases[currentPhaseIdx].duration;
    // 새 구간 저장
    saveWorkoutProgress(STATE.currentDay, currentPhaseIdx);
  }

  renderTimerScreen();
}

// 진동 유틸 (지원하지 않는 브라우저는 조용히 무시)
function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}


/* ====================================================
   ⑨ 운동 완료 처리
   ==================================================== */

function finishWorkout() {
  clearInterval(timerInterval);
  releaseWakeLock();
  clearWorkoutProgress();
  markDayComplete(STATE.currentDay);
}

// 특정 일차를 완료 처리
function markDayComplete(day) {
  // 이미 완료한 날은 중복 추가 안 함
  if (!STATE.completedDays.includes(day)) {
    STATE.completedDays.push(day);
  }

  // 7일 모두 완료했으면 완주 화면
  if (STATE.completedDays.length >= 7) {
    saveState(STATE);
    showScreen('screen-complete');
    return;
  }

  // 다음 날로 이동
  STATE.currentDay = day + 1;
  saveState(STATE);
  renderHome();
}

// 회복일 완료 버튼
function markRestDone() {
  markDayComplete(STATE.currentDay);
}


/* ====================================================
   ⑩ 뒤로가기 (타이머 → 홈)
   ==================================================== */

function goBack() {
  // 확인 팝업 — 취소하면 그냥 타이머 계속 진행
  const confirmed = confirm('운동을 중단할까요?\n나가면 오늘 진행이 초기화돼요.');
  if (!confirmed) return;

  // 타이머 중지
  clearInterval(timerInterval);
  timerInterval = null;
  releaseWakeLock();
  clearWorkoutProgress();

  // 미니맵 초기화 (다음 번에 다시 그리기 위해)
  document.getElementById('phase-map').innerHTML = '';

  // 홈으로 돌아가기
  renderHome();
}


/* ====================================================
   ⑪ 앱 초기화 (처음부터 다시 시작)
   ==================================================== */

function resetApp() {
  // localStorage 삭제 후 초기 상태로
  localStorage.removeItem(APP_KEY);
  STATE = loadState();
  renderHome();
}


/* ====================================================
   ⑫ 앱 진입점 — 페이지 로드 시 실행
   ==================================================== */
(function init() {
  // 새로고침 전 운동 진행 중이었는지 확인
  const progress = loadWorkoutProgress();
  if (
    progress &&
    progress.day === STATE.currentDay &&
    !STATE.completedDays.includes(progress.day)
  ) {
    const plan = CURRICULUM[progress.day - 1];
    if (plan && plan.type === 'workout') {
      const phase = plan.phases[progress.phaseIdx];
      const resume = confirm(
        `이전에 ${progress.day}일차 운동 중이었어요.\n` +
        `"${phase?.label || ''}" 구간부터 이어서 할까요?`
      );
      if (resume) {
        // 타이머 상태 복원
        currentPhases   = plan.phases;
        currentPhaseIdx = progress.phaseIdx;
        totalDuration   = totalSeconds(currentPhases);
        remainingSec    = currentPhases[currentPhaseIdx].duration;
        totalElapsed    = currentPhases
          .slice(0, currentPhaseIdx)
          .reduce((s, p) => s + p.duration, 0);

        renderTimerScreen();
        showQuote(progress.day);
        showScreen('screen-timer');
        requestWakeLock();
        timerInterval = setInterval(tick, 1000);
        return;
      } else {
        clearWorkoutProgress();
      }
    }
  }

  // 7일 모두 완료한 상태면 완주 화면으로
  if (STATE.completedDays.length >= 7) {
    showScreen('screen-complete');
  } else {
    renderHome();
  }
})();