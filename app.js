/* ====================================================
   app.js — 첫 발걸음 런닝 앱 (C25K 9주 버전 / v2)
   기술 스택: Vanilla JavaScript + localStorage
   ----------------------------------------------------
   v2 변경 사항
   - 타이머: Date.now() 기반으로 재작성 (백그라운드/throttling 대응)
   - Wake Lock API 자동 적용 (운동 중 화면 꺼짐 방지)
   - CURRICULUM: 헬퍼 함수로 압축 (700줄 → 30줄)
   - 전역 변수 → Workout 객체로 통합
   - 1주차 인터벌 8세트 → 6세트로 완화 (첫날 부담 축소)
   ==================================================== */


/* ====================================================
   ① 설정값 + 커리큘럼 빌더
   ==================================================== */

const APP_KEY = 'firststep_c25k';

// 잠금 기능 플래그
// 개발 중: false (어느 주차든 자유롭게 접근 가능)
// 앱 출시 시: true 로 바꾸면 순서대로만 진행 가능
const LOCK_ENABLED = false;

const WARMUP_SEC   = 5 * 60;
const COOLDOWN_SEC = 5 * 60;

// 인터벌 세션 빌더: 워밍업 + (조깅 + 걷기) × repeats + 쿨다운
function intervalSession(week, session, jogSec, walkSec, repeats) {
  const phases = [{ label: '워밍업', type: 'warmup', duration: WARMUP_SEC }];
  for (let i = 0; i < repeats; i++) {
    phases.push({ label: '조깅', type: 'jog',  duration: jogSec });
    phases.push({ label: '걷기', type: 'walk', duration: walkSec });
  }
  phases.push({ label: '쿨다운', type: 'cooldown', duration: COOLDOWN_SEC });
  return { week, session, title: '', type: 'workout', phases };
}

// 자유 구성 세션 빌더: 워밍업 + [임의 phases] + 쿨다운
function customSession(week, session, mid) {
  return {
    week, session, title: '', type: 'workout',
    phases: [
      { label: '워밍업', type: 'warmup', duration: WARMUP_SEC },
      ...mid,
      { label: '쿨다운', type: 'cooldown', duration: COOLDOWN_SEC },
    ],
  };
}

// 헬퍼: 조깅/걷기 phase 생성
const jog  = (sec) => ({ label: '조깅', type: 'jog',  duration: sec });
const walk = (sec) => ({ label: '걷기', type: 'walk', duration: sec });

// 같은 세션 3회 반복용
function repeatThree(week, build) {
  return [1, 2, 3].map(s => build(week, s));
}

// ── C25K 9주 커리큘럼 ──────────────────────────────────
// 공식 c25k.com 기반. 단, 1주차는 8세트 → 6세트로 완화.
// 1주차 1~3회차: 조깅 60s + 걷기 90s × 6 (총 ~25분)
const CURRICULUM = [
  // 1주차: 조깅 1분 + 걷기 1분30초 × 6 (완화 적용)
  ...repeatThree(1, (w, s) => intervalSession(w, s, 60, 90, 6)),
  // 2주차: 조깅 1분30초 + 걷기 2분 × 6
  ...repeatThree(2, (w, s) => intervalSession(w, s, 90, 120, 6)),
  // 3주차: 2세트(조깅90초 + 걷기90초 + 조깅3분 + 걷기3분)
  ...repeatThree(3, (w, s) => customSession(w, s, [
    jog(90), walk(90), jog(180), walk(180),
    jog(90), walk(90), jog(180), walk(180),
  ])),
  // 4주차: 조깅3분 + 걷기90초 + 조깅5분 + 걷기2분30초 + 조깅3분 + 걷기90초 + 조깅5분
  ...repeatThree(4, (w, s) => customSession(w, s, [
    jog(180), walk(90), jog(300), walk(150),
    jog(180), walk(90), jog(300),
  ])),
  // 5주차: 회차별 다름
  customSession(5, 1, [jog(300), walk(180), jog(300), walk(180), jog(300)]),
  customSession(5, 2, [jog(480), walk(300), jog(480)]),
  customSession(5, 3, [jog(20 * 60)]),
  // 6주차: 회차별 다름
  customSession(6, 1, [jog(300), walk(180), jog(480), walk(180), jog(300)]),
  customSession(6, 2, [jog(600), walk(180), jog(600)]),
  customSession(6, 3, [jog(25 * 60)]),
  // 7주차: 25분 연속 × 3
  ...repeatThree(7, (w, s) => customSession(w, s, [jog(25 * 60)])),
  // 8주차: 28분 연속 × 3
  ...repeatThree(8, (w, s) => customSession(w, s, [jog(28 * 60)])),
  // 9주차: 30분 연속 × 3 (= 5K 완주!)
  ...repeatThree(9, (w, s) => customSession(w, s, [jog(30 * 60)])),
];

// 총 세션 수
const TOTAL_SESSIONS = CURRICULUM.length; // 27

// 구간 타입별 색상 CSS 클래스
const PHASE_CHIP_CLASS = {
  warmup:   'chip-warmup',
  jog:      'chip-jog',
  walk:     'chip-walk',
  cooldown: 'chip-cooldown',
};

// 구간 타입별 화면 레이블
const PHASE_LABELS = {
  warmup:   '발목, 무릎 스트레칭 후 가볍게 걸으며 준비해요',
  jog:      '편하게 달려요',
  walk:     '숨 고르기',
  cooldown: '천천히 걸으며 마무리해요',
};


/* ====================================================
   ② 테마 (라이트 / 다크)
   ==================================================== */

const THEME_KEY = APP_KEY + '_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    btn.title = theme === 'dark' ? '다크 모드 (탭해서 라이트로)' : '라이트 모드 (탭해서 다크로)';
  });
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');

  // 타이머 화면이 열려있으면 배경색도 즉시 갱신
  const timerActive = document.getElementById('screen-timer').classList.contains('active');
  if (timerActive && Workout.phases.length > 0) {
    applyPhaseBackground(Workout.phases[Workout.phaseIdx].type);
  }
}

applyTheme(localStorage.getItem(THEME_KEY) || 'light');


/* ====================================================
   ③ 앱 상태 저장/복원
   ==================================================== */

function loadState() {
  const saved = localStorage.getItem(APP_KEY);
  if (saved) return JSON.parse(saved);
  return {
    currentIdx: 0,           // 현재 세션 인덱스 (0~26)
    completedIdx: [],        // 완료한 세션 인덱스 배열
  };
}

function saveState(state) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

let STATE = loadState();


/* ====================================================
   ④ Workout — 운동 진행 상태 통합 객체
   ----------------------------------------------------
   타이머는 Date.now() 기반으로 동작.
   - phaseStartTime: 현재 phase가 시작된 절대 시각 (ms)
   - 화면 갱신은 1초마다 하지만, 시간 계산은 항상
     "지금 시각 - 시작 시각"으로 함 → 백그라운드 throttling
     영향 받지 않음
   ==================================================== */

const Workout = {
  // 정적 데이터
  sessionIdx: 0,
  phases: [],
  totalDuration: 0,

  // 진행 상태
  phaseIdx: 0,
  phaseStartTime: 0,       // 현재 phase 시작 시각 (Date.now)
  prevPhasesElapsed: 0,    // 이전 phase들의 누적 시간 (초)

  // 타이머
  intervalId: null,
  wakeLock: null,

  // 현재 phase에서 경과한 초
  phaseElapsedSec() {
    return Math.floor((Date.now() - this.phaseStartTime) / 1000);
  },

  // 현재 phase 남은 초 (음수가 될 수 있음 → 다음 phase로 넘어감)
  phaseRemainingSec() {
    return this.phases[this.phaseIdx].duration - this.phaseElapsedSec();
  },

  // 전체 경과 초
  totalElapsedSec() {
    return this.prevPhasesElapsed + this.phaseElapsedSec();
  },

  isLastPhase() {
    return this.phaseIdx === this.phases.length - 1;
  },

  isFinished() {
    return this.isLastPhase() && this.phaseRemainingSec() <= 0;
  },
};


/* ====================================================
   ④-2 운동 진행 상태 저장 (새로고침 대비)
   ----------------------------------------------------
   sessionStartTime을 저장하면 새로고침 후에도 정확히
   몇 초 진행됐는지 복원 가능
   ==================================================== */

const WORKOUT_KEY = APP_KEY + '_workout';

function saveWorkoutProgress() {
  const data = {
    sessionIdx:      Workout.sessionIdx,
    phaseIdx:        Workout.phaseIdx,
    phaseStartTime:  Workout.phaseStartTime,
    prevPhasesElapsed: Workout.prevPhasesElapsed,
    date: new Date().toLocaleDateString('ko-KR'),
  };
  localStorage.setItem(WORKOUT_KEY, JSON.stringify(data));
}

function clearWorkoutProgress() {
  localStorage.removeItem(WORKOUT_KEY);
}

function loadWorkoutProgress() {
  const saved = localStorage.getItem(WORKOUT_KEY);
  if (!saved) return null;
  const data = JSON.parse(saved);
  const today = new Date().toLocaleDateString('ko-KR');
  if (data.date !== today) { clearWorkoutProgress(); return null; }
  return data;
}


/* ====================================================
   ⑤ Wake Lock — 운동 중 화면 꺼짐 방지
   ----------------------------------------------------
   iOS Safari 16.4+, Chrome, Edge 지원
   탭이 다시 visible 되면 자동 재요청
   ==================================================== */

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    Workout.wakeLock = await navigator.wakeLock.request('screen');
    Workout.wakeLock.addEventListener('release', () => {
      // 시스템이 release 했을 수도 있음
    });
  } catch (e) {
    // 권한 거부 / 배터리 부족 등 — 무시 (사용자가 직접 화면 켜둘 수 있음)
    console.warn('Wake Lock 실패:', e.message);
  }
}

function releaseWakeLock() {
  if (Workout.wakeLock) {
    Workout.wakeLock.release().catch(() => {});
    Workout.wakeLock = null;
  }
}

// 탭이 다시 활성화되면 wake lock 재요청 (운동 중일 때만)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Workout.intervalId) {
    requestWakeLock();
  }
});


/* ====================================================
   ⑥ 구간 배경색
   ==================================================== */

const PHASE_BG = {
  light: { warmup: '#e8c97a', jog: '#d4845a', walk: '#6aaa8c', cooldown: '#e8c97a' },
  dark:  { warmup: '#4a3a10', jog: '#5a2e18', walk: '#1a4a38', cooldown: '#4a3a10' },
};
const PHASE_TEXT_COLOR = {
  light: { warmup: '#5a4510', jog: '#ffffff', walk: '#ffffff', cooldown: '#5a4510' },
  dark:  { warmup: '#e8c97a', jog: '#d4845a', walk: '#6aaa8c', cooldown: '#e8c97a' },
};

function applyPhaseBackground(phaseType) {
  const isDark = (localStorage.getItem(THEME_KEY) || 'light') === 'dark';
  const mode   = isDark ? 'dark' : 'light';
  const bg     = PHASE_BG[mode][phaseType]        || 'var(--bg)';
  const color  = PHASE_TEXT_COLOR[mode][phaseType] || 'var(--text)';

  const screen = document.getElementById('screen-timer');
  screen.style.background = bg;
  screen.style.transition = 'background 0.5s ease';

  document.getElementById('phase-label').style.color = color;
  document.getElementById('timer-min').style.color   = color;
  document.getElementById('timer-sec').style.color   = color;
  const colon = document.querySelector('.timer-colon');
  if (colon) colon.style.color = color;
  document.getElementById('phase-desc').style.color  =
    isDark ? color : 'rgba(0,0,0,0.55)';
}

function clearPhaseBackground() {
  const screen = document.getElementById('screen-timer');
  screen.style.background = '';
  ['phase-label', 'timer-min', 'timer-sec', 'phase-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.color = '';
  });
  const colon = document.querySelector('.timer-colon');
  if (colon) colon.style.color = '';
}


/* ====================================================
   ⑦ 화면 전환
   ==================================================== */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


/* ====================================================
   ⑧ 홈 화면 렌더링
   ==================================================== */

function renderHome() {
  showScreen('screen-home');

  const btn = document.getElementById('btn-start');
  btn.onclick   = startWorkout;
  btn.disabled  = false;
  btn.style.opacity = '1';
  btn.textContent   = '시작하기 →';

  const idx    = STATE.currentIdx;
  const plan   = CURRICULUM[idx];
  const isDone = STATE.completedIdx.includes(idx);

  document.getElementById('home-week-label').textContent = `${plan.week}주차`;
  document.getElementById('home-progress-label').textContent =
    `${STATE.completedIdx.length} / ${TOTAL_SESSIONS} 완료`;

  drawWeekGrid();

  if (isDone) {
    document.getElementById('today-card').classList.add('hidden');
    document.getElementById('done-card').classList.remove('hidden');

    const nextMsg = STATE.completedIdx.length >= TOTAL_SESSIONS
      ? '9주 완주를 축하해요! 🎉'
      : `다음: ${CURRICULUM[idx + 1]?.week}주차 ${CURRICULUM[idx + 1]?.session}회차`;
    document.getElementById('done-next').textContent = nextMsg;

  } else {
    document.getElementById('today-card').classList.remove('hidden');
    document.getElementById('done-card').classList.add('hidden');

    document.getElementById('today-title').textContent =
      plan.title
        ? `${plan.week}주차 ${plan.session}회차 — ${plan.title}`
        : `${plan.week}주차 ${plan.session}회차`;
    document.getElementById('today-meta').textContent = buildWorkoutMeta(plan);
  }
}

function drawWeekGrid() {
  const grid = document.getElementById('week-grid');
  grid.innerHTML = '';

  for (let w = 1; w <= 9; w++) {
    const weekRow = document.createElement('div');
    weekRow.className = 'week-row';

    const weekLabel = document.createElement('div');
    weekLabel.className = 'week-label';
    weekLabel.textContent = `${w}주`;
    weekRow.appendChild(weekLabel);

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'week-dots';

    for (let s = 1; s <= 3; s++) {
      const sesIdx = (w - 1) * 3 + (s - 1);
      const isDone    = STATE.completedIdx.includes(sesIdx);
      const isCurrent = sesIdx === STATE.currentIdx && !isDone;
      const isLocked  = LOCK_ENABLED && sesIdx > STATE.currentIdx;

      const dot = document.createElement('button');
      dot.className = 'session-dot' +
        (isDone ? ' dot-done' : '') +
        (isCurrent ? ' dot-current' : '') +
        (isLocked ? ' dot-locked' : '');
      dot.textContent = isDone ? '✓' : s;
      dot.title = `${w}주차 ${s}회차`;
      dot.addEventListener('click', () => showSessionCard(sesIdx));
      dotsWrap.appendChild(dot);
    }

    weekRow.appendChild(dotsWrap);
    grid.appendChild(weekRow);
  }
}

function showSessionCard(sesIdx) {
  const plan     = CURRICULUM[sesIdx];
  const isDone   = STATE.completedIdx.includes(sesIdx);
  const isLocked = LOCK_ENABLED && sesIdx > STATE.currentIdx;

  document.getElementById('done-card').classList.add('hidden');
  document.getElementById('today-card').classList.remove('hidden');

  const statusEmoji = isDone ? '✓ ' : (isLocked ? '🔒 ' : '');
  document.getElementById('today-title').textContent = statusEmoji + (
    plan.title
      ? `${plan.week}주차 ${plan.session}회차 — ${plan.title}`
      : `${plan.week}주차 ${plan.session}회차`
  );
  document.getElementById('today-meta').textContent = buildWorkoutMeta(plan);

  const btn = document.getElementById('btn-start');
  if (isDone) {
    btn.textContent = '완료한 세션이에요 ✓';
    btn.disabled = true;
    btn.style.opacity = '0.4';
  } else if (isLocked) {
    btn.textContent = '이전 세션을 먼저 완료해야 해요';
    btn.disabled = true;
    btn.style.opacity = '0.4';
  } else {
    btn.textContent = '시작하기 →';
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.onclick = () => {
      STATE.currentIdx = sesIdx;
      saveState(STATE);
      startWorkout();
    };
  }
}


/* ====================================================
   ⑨ 유틸 함수
   ==================================================== */

function totalSeconds(phases) {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

function fmtSec(sec) {
  if (sec < 60) return `${sec}초`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}분` : `${m}분 ${s}초`;
}

function buildWorkoutMeta(plan) {
  const mins      = Math.round(totalSeconds(plan.phases) / 60);
  const jogPhases = plan.phases.filter(p => p.type === 'jog');
  const jogCount  = jogPhases.length;

  if (jogCount === 1) {
    return `총 ${mins}분 · 연속 조깅 ${fmtSec(jogPhases[0].duration)}`;
  }

  // 복잡한 인터벌 (3,4주차) vs 단순 인터벌 (1,2주차) 분기
  const allSameJog  = jogPhases.every(p => p.duration === jogPhases[0].duration);
  const walkPhases  = plan.phases.filter(p => p.type === 'walk');
  const allSameWalk = walkPhases.every(p => p.duration === walkPhases[0].duration);

  if (allSameJog && allSameWalk) {
    return `총 ${mins}분 · ${jogCount}세트 (조깅 ${fmtSec(jogPhases[0].duration)} + 걷기 ${fmtSec(walkPhases[0].duration)})`;
  }
  return `총 ${mins}분 · 인터벌 ${jogCount}회`;
}


/* ====================================================
   ⑩ 운동 시작 / 재개
   ==================================================== */

function startWorkout() {
  document.getElementById('btn-start').onclick = startWorkout;

  const plan = CURRICULUM[STATE.currentIdx];

  Workout.sessionIdx        = STATE.currentIdx;
  Workout.phases            = plan.phases;
  Workout.totalDuration     = totalSeconds(plan.phases);
  Workout.phaseIdx          = 0;
  Workout.phaseStartTime    = Date.now();
  Workout.prevPhasesElapsed = 0;

  saveWorkoutProgress();
  requestWakeLock();
  buildPhaseMap();
  renderTimerScreen();
  showScreen('screen-timer');

  Workout.intervalId = setInterval(tick, 1000);
}

function resumeWorkout(progress) {
  const plan = CURRICULUM[progress.sessionIdx];

  Workout.sessionIdx        = progress.sessionIdx;
  Workout.phases            = plan.phases;
  Workout.totalDuration     = totalSeconds(plan.phases);
  Workout.phaseIdx          = progress.phaseIdx;
  Workout.phaseStartTime    = progress.phaseStartTime;
  Workout.prevPhasesElapsed = progress.prevPhasesElapsed;

  // 재개 시 phase 경계를 넘었을 수도 있음 → 보정
  catchUpPhases();

  requestWakeLock();
  buildPhaseMap();
  renderTimerScreen();
  showScreen('screen-timer');

  Workout.intervalId = setInterval(tick, 1000);
}

// 한 번에 여러 phase를 건너뛰어야 할 때 (백그라운드/새로고침 후)
function catchUpPhases() {
  while (
    Workout.phaseIdx < Workout.phases.length - 1 &&
    Workout.phaseRemainingSec() <= 0
  ) {
    const finished = Workout.phases[Workout.phaseIdx];
    Workout.prevPhasesElapsed += finished.duration;
    // 다음 phase는 이전 phase가 끝난 시점부터 시작
    Workout.phaseStartTime += finished.duration * 1000;
    Workout.phaseIdx++;
  }
}


/* ====================================================
   ⑪ 타이머 화면 렌더링
   ==================================================== */

function renderTimerScreen() {
  const phase = Workout.phases[Workout.phaseIdx];

  document.getElementById('phase-label').textContent = phase.label;
  document.getElementById('phase-desc').textContent  = PHASE_LABELS[phase.type] || '';

  const tipsEl = document.getElementById('running-tips');
  if (phase.type === 'warmup') {
    tipsEl.classList.remove('hidden');
  } else {
    tipsEl.classList.add('hidden');
  }

  applyPhaseBackground(phase.type);

  if (document.getElementById('phase-map').children.length === 0) buildPhaseMap();
  updatePhaseMap();

  const remaining = Math.max(0, Workout.phaseRemainingSec());
  updateTimerDisplay(remaining);

  const pct = Math.min(100, (Workout.totalElapsedSec() / Workout.totalDuration) * 100);
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('total-time-label').textContent =
    `총 ${Math.round(Workout.totalDuration / 60)}분`;

  document.getElementById('btn-finish').classList.toggle('hidden', !Workout.isFinished());
}

function buildPhaseMap() {
  const map = document.getElementById('phase-map');
  map.innerHTML = '';
  Workout.phases.forEach((p, i) => {
    const chip = document.createElement('div');
    chip.className = `phase-chip ${PHASE_CHIP_CLASS[p.type] || ''}`;
    chip.id = `chip-${i}`;
    chip.style.flex = 1;
    map.appendChild(chip);
  });
}

function updatePhaseMap() {
  Workout.phases.forEach((_, i) => {
    const chip = document.getElementById(`chip-${i}`);
    if (!chip) return;
    chip.classList.remove('active', 'done');
    if (i < Workout.phaseIdx)         chip.classList.add('done');
    else if (i === Workout.phaseIdx)  chip.classList.add('active');
  });
}

function updateTimerDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  document.getElementById('timer-min').textContent = String(m).padStart(2, '0');
  document.getElementById('timer-sec').textContent = String(s).padStart(2, '0');
}


/* ====================================================
   ⑫ 타이머 틱 (1초마다 화면 갱신)
   ----------------------------------------------------
   시간 계산은 Workout.phaseRemainingSec() 등을 통해
   모두 Date.now() 기반. tick은 화면을 다시 그리기만 함.
   ==================================================== */

function tick() {
  const prevPhaseIdx = Workout.phaseIdx;

  // phase 경계를 넘었는지 확인 (한 번에 여러 개도 넘을 수 있음)
  catchUpPhases();

  // 마지막 phase를 다 마쳤으면 정지
  if (Workout.isFinished()) {
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;
    renderTimerScreen();
    document.getElementById('btn-finish').classList.remove('hidden');
    vibrate([200, 100, 200]);
    return;
  }

  // phase가 바뀌었으면 진동 + 저장
  if (Workout.phaseIdx !== prevPhaseIdx) {
    vibrate([100]);
    saveWorkoutProgress();
  }

  renderTimerScreen();
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}


/* ====================================================
   ⑬ 운동 완료 + 피드백
   ==================================================== */

function finishWorkout() {
  if (Workout.intervalId) {
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;
  }
  releaseWakeLock();
  clearPhaseBackground();
  clearWorkoutProgress();

  const plan = CURRICULUM[Workout.sessionIdx];
  const isLastSessionOfWeek = plan.session === 3;

  document.getElementById('running-tips').classList.add('hidden');
  document.getElementById('phase-map').innerHTML = '';

  if (isLastSessionOfWeek) {
    showFeedbackScreen(plan.week);
  } else {
    markSessionComplete(Workout.sessionIdx);
  }
}

function showFeedbackScreen(week) {
  document.getElementById('feedback-title').textContent = `${week}주차 완료!`;
  document.getElementById('feedback-hard-confirm').classList.add('hidden');
  document.getElementById('feedback-easy-warning').classList.add('hidden');
  document.querySelector('.feedback-buttons').classList.remove('hidden');
  document.querySelector('.feedback-sub').classList.remove('hidden');
  showScreen('screen-feedback');
}

function handleFeedback(type) {
  const plan = CURRICULUM[Workout.sessionIdx];
  const week = plan.week;

  if (type === 'hard') {
    document.querySelector('.feedback-buttons').classList.add('hidden');
    document.querySelector('.feedback-sub').classList.add('hidden');
    document.getElementById('confirm-msg').textContent =
      `${week}주차를 한 번 더 할까요?`;
    document.getElementById('feedback-hard-confirm').classList.remove('hidden');

  } else if (type === 'easy') {
    document.getElementById('feedback-easy-warning').classList.remove('hidden');
    setTimeout(() => {
      markSessionComplete(Workout.sessionIdx);
    }, 2500);

  } else {
    markSessionComplete(Workout.sessionIdx);
  }
}

function confirmRepeat() {
  const plan = CURRICULUM[Workout.sessionIdx];
  const week = plan.week;
  const firstIdxOfWeek = (week - 1) * 3;

  STATE.completedIdx = STATE.completedIdx.filter(
    i => i < firstIdxOfWeek || i >= firstIdxOfWeek + 3
  );
  STATE.currentIdx = firstIdxOfWeek;
  saveState(STATE);
  renderHome();
}

function markSessionComplete(idx) {
  if (!STATE.completedIdx.includes(idx)) {
    STATE.completedIdx.push(idx);
  }

  if (STATE.completedIdx.length >= TOTAL_SESSIONS) {
    saveState(STATE);
    showScreen('screen-complete');
    return;
  }

  let nextIdx = idx + 1;
  while (nextIdx < TOTAL_SESSIONS && STATE.completedIdx.includes(nextIdx)) {
    nextIdx++;
  }
  STATE.currentIdx = Math.min(nextIdx, TOTAL_SESSIONS - 1);
  saveState(STATE);
  renderHome();
}


/* ====================================================
   ⑭ 뒤로가기
   ==================================================== */

function goBack() {
  const confirmed = confirm('운동을 중단할까요?');
  if (!confirmed) return;

  if (Workout.intervalId) {
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;
  }
  releaseWakeLock();
  clearWorkoutProgress();
  clearPhaseBackground();
  document.getElementById('phase-map').innerHTML = '';
  renderHome();
}


/* ====================================================
   ⑮ 앱 초기화
   ==================================================== */

function resetApp() {
  if (!confirm('모든 진행 상황이 초기화돼요. 계속할까요?')) return;
  localStorage.removeItem(APP_KEY);
  clearWorkoutProgress();
  STATE = loadState();
  renderHome();
}


/* ====================================================
   ⑯ 진입점
   ==================================================== */
(function init() {
  const progress = loadWorkoutProgress();
  if (
    progress &&
    progress.sessionIdx === STATE.currentIdx &&
    !STATE.completedIdx.includes(progress.sessionIdx)
  ) {
    const plan = CURRICULUM[progress.sessionIdx];
    if (plan && plan.type === 'workout') {
      const phase = plan.phases[progress.phaseIdx];
      const resume = confirm(
        `이전에 ${plan.week}주차 ${plan.session}회차 운동 중이었어요.\n` +
        `"${phase?.label || ''}" 구간부터 이어서 할까요?`
      );
      if (resume) {
        document.getElementById('phase-map').innerHTML = '';
        resumeWorkout(progress);
        return;
      } else {
        clearWorkoutProgress();
      }
    }
  }

  if (STATE.completedIdx.length >= TOTAL_SESSIONS) {
    showScreen('screen-complete');
  } else {
    renderHome();
  }
})();