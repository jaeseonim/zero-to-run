/* ====================================================
   app.js — 첫 발걸음 런닝 앱 (C25K 9주 버전 / v3)
   기술 스택: Vanilla JavaScript + Firebase (Auth + Firestore)
   ----------------------------------------------------
   v3 변경 사항
   - Google 로그인 추가 (firebase.auth)
   - localStorage → Firestore 데이터 저장 (users/{uid}/progress)
   - 타이머 진행 상태는 localStorage 유지 (빠른 응답 필요)
   ==================================================== */


/* ====================================================
   ① Firebase 초기화
   ==================================================== */

// Firebase 프로젝트 설정값 (Firebase 콘솔에서 복사한 값)
const firebaseConfig = {
  apiKey:            "AIzaSyAbbxDF3t7vmls_mHHUToh07OrBbODEp10",
  authDomain:        "zero-to-run.firebaseapp.com",
  projectId:         "zero-to-run",
  storageBucket:     "zero-to-run.firebasestorage.app",
  messagingSenderId: "410289819434",
  appId:             "1:410289819434:web:5c755982f2c1bfc3b49853",
};

// Firebase 앱 초기화 (compat CDN 방식 — firebase 객체가 전역으로 등록됨)
firebase.initializeApp(firebaseConfig);

// 인증 기능 초기화 (Google 로그인에 사용)
const auth = firebase.auth();

// Firestore 데이터베이스 초기화 (진행 상황 저장에 사용)
const db = firebase.firestore();

// 현재 로그인된 유저 (로그아웃 시 null, 로그인 시 Firebase User 객체)
let currentUser = null;


/* ====================================================
   ② 설정값 + 커리큘럼 빌더
   ==================================================== */

const APP_KEY = 'firststep_c25k';

// 잠금 기능 플래그
// 개발 중: false (어느 주차든 자유롭게 접근 가능)
// 앱 출시 시: true 로 바꾸면 순서대로만 진행 가능
const LOCK_ENABLED = true;

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
   ③ 테마 (라이트 / 다크) — localStorage 유지
   ==================================================== */

const THEME_KEY = APP_KEY + '_theme'; // 테마는 기기별 설정이므로 localStorage에 그대로 저장

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    btn.title = theme === 'dark' ? '다크 모드 (탭해서 라이트로)' : '라이트 모드 (탭해서 다크로)';
  });
  localStorage.setItem(THEME_KEY, theme); // 테마는 여전히 localStorage에 저장
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

// 앱 시작 시 저장된 테마 즉시 적용 (로그인 전에도 동작)
applyTheme(localStorage.getItem(THEME_KEY) || 'light');


/* ====================================================
   ④ 앱 상태 저장/복원 — Firestore 연동
   ==================================================== */

// 앱 상태 기본값 (Firestore에서 불러오기 전 또는 신규 유저)
let STATE = { currentIdx: 0, completedIdx: [] };

// Firestore에서 진행 상황 불러오기 (비동기 — await 필요)
async function loadState(uid) {
  try {
    // users/{uid} 문서를 읽어옴
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists && doc.data().progress) {
      const data = doc.data().progress;
      // 각 필드가 없을 경우를 대비해 기본값으로 보호 (??는 null/undefined일 때만 기본값 사용)
      return {
        currentIdx:   data.currentIdx   ?? 0,
        completedIdx: data.completedIdx ?? [],
      };
    }
  } catch (e) {
    // 네트워크 오류 등 — 기본값으로 진행
    console.error('진행 상황 불러오기 실패:', e);
  }
  // 처음 사용하는 유저 또는 불러오기 실패 시 초기값 반환
  return { currentIdx: 0, completedIdx: [] };
}

// Firestore에 진행 상황 저장하기 (fire-and-forget — 결과를 기다리지 않음)
function saveState(state) {
  if (!currentUser) return; // 로그인 안 된 경우 저장 건너뜀

  // users/{uid} 문서의 progress 필드만 업데이트 (merge: true → 다른 필드는 건드리지 않음)
  db.collection('users').doc(currentUser.uid).set(
    {
      progress: {
        currentIdx:    state.currentIdx,    // 현재 세션 번호
        completedIdx:  state.completedIdx,  // 완료한 세션 목록
      }
    },
    { merge: true } // 문서의 다른 필드는 유지
  ).catch(e => console.error('진행 상황 저장 실패:', e)); // 저장 실패해도 앱은 계속 동작
}


/* ====================================================
   ⑤ Google 로그인 / 로그아웃
   ==================================================== */

// Google 로그인 (팝업 방식 — GitHub Pages 호환)
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider(); // Google 로그인 공급자 생성
  auth.signInWithPopup(provider)
    .catch(e => {
      if (
        e.code === 'auth/cancelled-popup-request' || // 버튼 중복 클릭 시 — 무시
        e.code === 'auth/popup-closed-by-user'       // 사용자가 팝업 직접 닫음 — 무시
      ) return;

      if (e.code === 'auth/popup-blocked') {
        // 브라우저가 팝업을 차단한 경우 (iOS Safari 등)
        alert('팝업이 차단됐어요.\n브라우저 설정에서 팝업을 허용해주세요.');
        return;
      }

      alert('로그인에 실패했어요. 다시 시도해주세요.\n(' + e.message + ')');
    });
}

// 로그아웃
function logout() {
  if (!confirm('로그아웃 할까요?')) return;
  auth.signOut(); // Firebase 로그아웃 → onAuthStateChanged가 null user로 재실행됨
  // 로그아웃 후 → onAuthStateChanged가 자동으로 로그인 화면으로 이동
}


/* ====================================================
   ⑥ Workout — 운동 진행 상태 통합 객체
   ----------------------------------------------------
   타이머는 Date.now() 기반으로 동작.
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

  // 일시정지 상태
  isPaused: false,
  pauseTime: 0,         // 일시정지 시작 시각 (Date.now)

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
   ⑦ 운동 진행 상태 저장 (새로고침 대비) — localStorage 유지
   ----------------------------------------------------
   1초마다 저장하므로 Firestore 대신 localStorage 사용
   (Firestore는 쓰기 비용과 지연이 있어 타이머에 부적합)
   ==================================================== */

const WORKOUT_KEY = APP_KEY + '_workout'; // 타이머 진행 상태는 localStorage에 계속 저장

function saveWorkoutProgress() {
  const data = {
    sessionIdx:        Workout.sessionIdx,
    phaseIdx:          Workout.phaseIdx,
    phaseStartTime:    Workout.phaseStartTime,
    prevPhasesElapsed: Workout.prevPhasesElapsed,
    isPaused:          Workout.isPaused,
    pauseTime:         Workout.pauseTime,
    date: new Date().toLocaleDateString('ko-KR'),
  };
  localStorage.setItem(WORKOUT_KEY, JSON.stringify(data)); // 빠른 저장: localStorage 사용
}

function clearWorkoutProgress() {
  localStorage.removeItem(WORKOUT_KEY); // 타이머 임시 데이터 삭제
}

function loadWorkoutProgress() {
  const saved = localStorage.getItem(WORKOUT_KEY);
  if (!saved) return null;
  const data = JSON.parse(saved);
  const today = new Date().toLocaleDateString('ko-KR');
  if (data.date !== today) { clearWorkoutProgress(); return null; } // 오늘 데이터가 아니면 무시
  return data;
}


/* ====================================================
   ⑧ Wake Lock — 운동 중 화면 꺼짐 방지
   ==================================================== */

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    Workout.wakeLock = await navigator.wakeLock.request('screen');
    Workout.wakeLock.addEventListener('release', () => {});
  } catch (e) {
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
   ⑨ 구간 배경색
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
   ⑩ 화면 전환
   ==================================================== */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


/* ====================================================
   ⑪ 홈 화면 렌더링
   ==================================================== */

function renderHome() {
  showScreen('screen-home');

  const btn = document.getElementById('btn-start');
  btn.onclick   = () => startWorkout();
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

    // ── 좌측: 주차 라벨 ──
    const weekLabel = document.createElement('div');
    weekLabel.className = 'week-label';
    weekLabel.textContent = `${w}주`;
    weekRow.appendChild(weekLabel);

    // ── 가운데: 세션 점 3개 ──
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'week-dots';

    let weekDoneCount = 0;
    for (let s = 1; s <= 3; s++) {
      const sesIdx = (w - 1) * 3 + (s - 1);
      const isDone    = STATE.completedIdx.includes(sesIdx);
      const isCurrent = sesIdx === STATE.currentIdx && !isDone;
      const isLocked  = LOCK_ENABLED && sesIdx > STATE.currentIdx;
      if (isDone) weekDoneCount++;

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

    // ── 우측: 주차 진행률 (라벨과 시각적 균형 + 카드 빈 공간을 채움) ──
    const status = document.createElement('div');
    const isWeekDone = weekDoneCount === 3;
    status.className = 'week-status' + (isWeekDone ? ' done' : '');
    status.textContent = isWeekDone ? '완료' : `${weekDoneCount}/3`;
    weekRow.appendChild(status);

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
    btn.textContent = '시작하기 →';
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.onclick = () => startWorkout(sesIdx); // STATE.currentIdx는 변경하지 않음
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
      saveState(STATE); // Firestore에 저장
      startWorkout();
    };
  }
}


/* ====================================================
   ⑫ 유틸 함수
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

  const walkPhases = plan.phases.filter(p => p.type === 'walk');

  const fmtRange = (phases) => {
    if (phases.length === 0) return '';
    const durations = phases.map(p => p.duration);
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    return min === max ? fmtSec(min) : `${fmtSec(min)}~${fmtSec(max)}`;
  };

  const setCount = Math.max(jogCount, walkPhases.length);
  return `총 ${mins}분 · ${setCount}세트 (조깅 ${fmtRange(jogPhases)} + 걷기 ${fmtRange(walkPhases)})`;
}


/* ====================================================
   ⑬ 운동 시작 / 재개
   ==================================================== */

function startWorkout(sessionIdx) {
  document.getElementById('btn-start').onclick = () => startWorkout();

  const idx  = (sessionIdx !== undefined) ? sessionIdx : STATE.currentIdx;
  const plan = CURRICULUM[idx];

  Workout.sessionIdx        = idx;
  Workout.phases            = plan.phases;
  Workout.totalDuration     = totalSeconds(plan.phases);
  Workout.phaseIdx          = 0;
  Workout.phaseStartTime    = Date.now();
  Workout.prevPhasesElapsed = 0;
  Workout.isPaused          = false;
  Workout.pauseTime         = 0;

  saveWorkoutProgress(); // 타이머 진행 상태는 localStorage에 저장
  requestWakeLock();
  buildPhaseMap();
  renderTimerScreen();
  showScreen('screen-timer');

  Workout.intervalId = setInterval(tick, 1000);
}

// loadedAt: confirm() 띄우기 직전 시각 (= 사실상 새로고침 시각).
// 저장 당시 일시정지 중이었으면 그 시점을, 아니었으면 새로고침 시각을
// "타이머가 멈춘 시점"으로 삼아 항상 일시정지 상태로 복원한다.
// 사용자가 재개하기를 눌러야만 타이머가 다시 시작된다.
function resumeWorkout(progress, loadedAt) {
  const plan = CURRICULUM[progress.sessionIdx];
  const now  = Date.now();

  Workout.sessionIdx        = progress.sessionIdx;
  Workout.phases            = plan.phases;
  Workout.totalDuration     = totalSeconds(plan.phases);
  Workout.phaseIdx          = progress.phaseIdx;
  Workout.prevPhasesElapsed = progress.prevPhasesElapsed;

  // "타이머가 멈춘 시점" 결정:
  //   - 저장 당시 이미 일시정지 중 → 일시정지를 누른 순간
  //   - 저장 당시 진행 중 → 새로고침한 순간(loadedAt)
  const frozenAt = (progress.isPaused && progress.pauseTime)
    ? progress.pauseTime
    : (loadedAt || now);

  // frozenAt 기준 경과 시간을 현재 시각에 맞게 재보정
  const elapsedAtFreeze = frozenAt - progress.phaseStartTime;
  Workout.phaseStartTime = now - elapsedAtFreeze;

  // 항상 일시정지 상태로 복원
  Workout.isPaused  = true;
  Workout.pauseTime = now;

  buildPhaseMap();
  renderTimerScreen(); // isPaused=true이므로 버튼이 '재개하기'로 표시됨
  showScreen('screen-timer');
  // interval 시작 안 함 — 재개하기 버튼을 눌러야 시작
}

// 한 번에 여러 phase를 건너뛰어야 할 때 (백그라운드/새로고침 후)
function catchUpPhases() {
  while (
    Workout.phaseIdx < Workout.phases.length - 1 &&
    Workout.phaseRemainingSec() <= 0
  ) {
    const finished = Workout.phases[Workout.phaseIdx];
    Workout.prevPhasesElapsed += finished.duration;
    Workout.phaseStartTime += finished.duration * 1000;
    Workout.phaseIdx++;
  }
}


/* ====================================================
   ⑭ 타이머 화면 렌더링
   ==================================================== */

function renderTimerScreen() {
  const phase = Workout.phases[Workout.phaseIdx];

  document.getElementById('phase-label').textContent = phase.label;
  document.getElementById('phase-desc').textContent  = PHASE_LABELS[phase.type] || '';

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

  // 일시정지 버튼 텍스트 동기화
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) pauseBtn.textContent = Workout.isPaused ? '재개하기' : '일시정지';
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
   ⑮-0 일시정지 / 재개
   ==================================================== */

function togglePause() {
  if (Workout.isPaused) {
    // ── 재개 ──
    // 일시정지 동안 흐른 시간만큼 phaseStartTime을 앞당겨
    // phaseElapsedSec()이 일시정지 전부터 자연스럽게 이어지게 한다.
    const pausedMs = Date.now() - Workout.pauseTime;
    Workout.phaseStartTime += pausedMs;

    Workout.isPaused  = false;
    Workout.pauseTime = 0;
    saveWorkoutProgress(); // 재개 상태를 즉시 저장 (이전 일시정지 기록 덮어쓰기)

    Workout.intervalId = setInterval(tick, 1000);
    requestWakeLock();

    document.getElementById('btn-pause').textContent = '일시정지';
  } else {
    // ── 일시정지 ──
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;

    Workout.isPaused  = true;
    Workout.pauseTime = Date.now();

    releaseWakeLock();
    saveWorkoutProgress(); // 일시정지 상태를 즉시 저장 (새로고침 대비)

    document.getElementById('btn-pause').textContent = '재개하기';
  }
}


/* ====================================================
   ⑮ 타이머 틱 (1초마다 화면 갱신)
   ==================================================== */

function tick() {
  const prevPhaseIdx = Workout.phaseIdx;

  catchUpPhases();

  if (Workout.isFinished()) {
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;
    renderTimerScreen();
    document.getElementById('btn-finish').classList.remove('hidden');
    vibrate([200, 100, 200]);
    return;
  }

  if (Workout.phaseIdx !== prevPhaseIdx) {
    vibrate([100]);
    saveWorkoutProgress(); // 구간이 바뀔 때마다 localStorage에 저장
  }

  renderTimerScreen();
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}


/* ====================================================
   ⑯ 운동 완료
   ----------------------------------------------------
   주차 마지막 세션의 강도 피드백 화면은 제거됨.
   세션 완료 시 항상 곧바로 다음 세션으로 진행한다.
   ==================================================== */

function finishWorkout() {
  if (Workout.intervalId) {
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;
  }
  releaseWakeLock();
  clearPhaseBackground();
  clearWorkoutProgress(); // 타이머 임시 데이터 삭제

  document.getElementById('phase-map').innerHTML = '';

  // 마지막 세션 여부와 관계 없이 항상 바로 다음으로 진행
  markSessionComplete(Workout.sessionIdx);
}

function markSessionComplete(idx) {
  // 이미 완료한 세션을 다시 완료한 경우 → STATE / completedIdx 변경 없이 홈으로
  if (STATE.completedIdx.includes(idx)) {
    renderHome();
    return;
  }

  STATE.completedIdx.push(idx); // 완료 세션 목록에 추가

  if (STATE.completedIdx.length >= TOTAL_SESSIONS) {
    saveState(STATE); // Firestore에 최종 저장
    showScreen('screen-complete');
    return;
  }

  let nextIdx = idx + 1;
  while (nextIdx < TOTAL_SESSIONS && STATE.completedIdx.includes(nextIdx)) {
    nextIdx++;
  }
  STATE.currentIdx = Math.min(nextIdx, TOTAL_SESSIONS - 1);
  saveState(STATE); // Firestore에 다음 세션 인덱스 저장
  renderHome();
}


/* ====================================================
   ⑰ 뒤로가기
   ==================================================== */

function goBack() {
  const confirmed = confirm('운동을 중단할까요?');
  if (!confirmed) return;

  if (Workout.intervalId) {
    clearInterval(Workout.intervalId);
    Workout.intervalId = null;
  }
  releaseWakeLock();
  clearWorkoutProgress(); // 타이머 임시 데이터 삭제
  clearPhaseBackground();
  document.getElementById('phase-map').innerHTML = '';
  renderHome();
}


/* ====================================================
   ⑱ 앱 초기화 (9주 완주 후 처음부터 다시 시작)
   ==================================================== */

function resetApp() {
  if (!confirm('모든 진행 상황이 초기화돼요. 계속할까요?')) return;
  clearWorkoutProgress(); // 타이머 임시 데이터 삭제
  STATE = { currentIdx: 0, completedIdx: [] }; // 메모리 상태 초기화
  saveState(STATE); // Firestore에도 초기화된 상태 저장
  renderHome();
}


/* ====================================================
   ⑲ 진입점 — Firebase 로그인 상태에 따라 화면 결정
   ==================================================== */
(function init() {
  // onAuthStateChanged: 앱 시작 시 + 로그인/로그아웃 때마다 자동으로 실행됨
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // ── 로그인된 경우 ──
      currentUser = user; // 전역 변수에 유저 정보 저장

      // Firestore에서 이 유저의 진행 상황을 불러옴 (비동기 대기)
      STATE = await loadState(user.uid);

      // 이전에 운동 중이었다면 이어서 할지 물어보기
      const progress = loadWorkoutProgress();
      if (
        progress &&
        progress.sessionIdx === STATE.currentIdx &&
        !STATE.completedIdx.includes(progress.sessionIdx)
      ) {
        const plan = CURRICULUM[progress.sessionIdx];
        if (plan && plan.type === 'workout') {
          const phase = plan.phases[progress.phaseIdx];
          const loadedAt = Date.now(); // confirm 띄우기 직전 시각 기록
          const resume = confirm(
            `이전에 ${plan.week}주차 ${plan.session}회차 운동 중이었어요.\n` +
            `"${phase?.label || ''}" 구간부터 이어서 할까요?`
          );
          if (resume) {
            document.getElementById('phase-map').innerHTML = '';
            resumeWorkout(progress, loadedAt); // confirm 대기 시간 보정용
            return; // 타이머 화면으로 이동했으므로 여기서 종료
          } else {
            clearWorkoutProgress(); // 이어서 안 할 경우 임시 데이터 삭제
          }
        }
      }

      // 9주 완주 여부에 따라 화면 결정
      if (STATE.completedIdx.length >= TOTAL_SESSIONS) {
        showScreen('screen-complete'); // 완주 화면
      } else {
        renderHome(); // 홈 화면
      }

    } else {
      // ── 로그인 안 된 경우 ──
      currentUser = null;
      showScreen('screen-login'); // 로그인 화면 표시
    }
  });
})();
