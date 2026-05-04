/* ====================================================
   app.js — 첫 발걸음 런닝 앱 (C25K 9주 버전)
   기술 스택: Vanilla JavaScript + localStorage
   ==================================================== */


/* ====================================================
   ① 설정값 모음
   ==================================================== */

const APP_KEY = 'firststep_c25k';

// 잠금 기능 플래그
// 개발 중: false (어느 주차든 자유롭게 접근 가능)
// 앱 출시 시: true 로 바꾸면 순서대로만 진행 가능
const LOCK_ENABLED = false;

// C25K 9주 커리큘럼 (공식 c25k.com 기반)
// 구조: 9주 × 주 3회 = 27 세션
// 각 세션: warmup(5분 워킹) + 인터벌 구간들 + cooldown(5분 워킹)
const CURRICULUM = [
  // ── 1주차 ──────────────────────────────────────────
  // 조깅 1분 + 걷기 1분30초 반복 × 8 (총 20분)
  {
    week: 1, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 1, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 1, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 2주차 ──────────────────────────────────────────
  // 조깅 1분30초 + 걷기 2분 반복 × 6 (총 20분)
  {
    week: 2, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 2, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 2, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 2 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 3주차 ──────────────────────────────────────────
  // 2세트: 조깅90초 + 걷기90초 + 조깅3분 + 걷기3분
  {
    week: 3, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 3, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 3, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 90 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 4주차 ──────────────────────────────────────────
  // 조깅3분 + 걷기90초 + 조깅5분 + 걷기2분30초 + 조깅3분 + 걷기90초 + 조깅5분
  {
    week: 4, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '걷기',        type: 'walk',    duration: 150 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 4, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '걷기',        type: 'walk',    duration: 150 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 4, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '걷기',        type: 'walk',    duration: 150 },
      { label: '조깅',        type: 'jog',     duration: 3 * 60 },
      { label: '걷기',        type: 'walk',    duration: 90 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 5주차 ──────────────────────────────────────────
  // 세션1: 조깅5분+걷기3분×3
  // 세션2: 조깅8분+걷기5분+조깅8분
  // 세션3: 조깅 20분 (첫 연속 달리기!)
  {
    week: 5, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 5, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 8 * 60 },
      { label: '걷기',        type: 'walk',    duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 8 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 5, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 20 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 6주차 ──────────────────────────────────────────
  // 세션1: 조깅5분+걷기3분+조깅8분+걷기3분+조깅5분
  // 세션2: 조깅10분+걷기3분+조깅10분
  // 세션3: 조깅 25분
  {
    week: 6, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 8 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 5 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 6, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 10 * 60 },
      { label: '걷기',        type: 'walk',    duration: 3 * 60 },
      { label: '조깅',        type: 'jog',     duration: 10 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 6, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 25 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 7주차 ──────────────────────────────────────────
  // 세션 모두: 조깅 25분
  {
    week: 7, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 25 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 7, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 25 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 7, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 25 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 8주차 ──────────────────────────────────────────
  // 세션 모두: 조깅 28분
  {
    week: 8, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 28 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 8, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 28 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 8, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 28 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },

  // ── 9주차 ──────────────────────────────────────────
  // 세션 모두: 조깅 30분 (= 5K 완주!)
  {
    week: 9, session: 1,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 30 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 9, session: 2,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 30 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
  {
    week: 9, session: 3,
    title: '', // ← 원하면 여기에 직접 입력
    type: 'workout',
    phases: [
      { label: '워밍업',    type: 'warmup',  duration: 5 * 60 },
      { label: '조깅',        type: 'jog',     duration: 30 * 60 },
      { label: '쿨다운',    type: 'cooldown', duration: 5 * 60 },
    ],
  },
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
  // 홈 + 타이머 화면 둘 다 버튼 업데이트
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
  if (timerActive && currentPhases.length > 0) {
    applyPhaseBackground(currentPhases[currentPhaseIdx].type);
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
    currentIdx: 0,          // 현재 세션 인덱스 (0~26)
    completedIdx: [],        // 완료한 세션 인덱스 배열
  };
}

function saveState(state) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

let STATE = loadState();


/* ====================================================
   ③-2 운동 진행 상태 (새로고침 대비)
   ==================================================== */

const WORKOUT_KEY = APP_KEY + '_workout';

function saveWorkoutProgress(idx, phaseIdx) {
  const today = new Date().toLocaleDateString('ko-KR', {year:'numeric', month:'2-digit', day:'2-digit'});
  localStorage.setItem(WORKOUT_KEY, JSON.stringify({ idx, phaseIdx, date: today }));
}

function clearWorkoutProgress() {
  localStorage.removeItem(WORKOUT_KEY);
}

function loadWorkoutProgress() {
  const saved = localStorage.getItem(WORKOUT_KEY);
  if (!saved) return null;
  const data = JSON.parse(saved);
  const today = new Date().toLocaleDateString('ko-KR', {year:'numeric', month:'2-digit', day:'2-digit'});
  if (data.date !== today) { clearWorkoutProgress(); return null; }
  return data;
}


/* ====================================================
   ④ 타이머 전역 변수 + 구간 배경색
   ==================================================== */
let timerInterval   = null;
let currentPhaseIdx = 0;
let remainingSec    = 0;
let totalElapsed    = 0;
let totalDuration   = 0;
let currentPhases   = [];

// 구간별 배경색 (라이트 / 다크)
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
   ④ 화면 전환
   ==================================================== */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


/* ====================================================
   ⑤ 홈 화면 렌더링
   ==================================================== */

function renderHome() {
  showScreen('screen-home');

  // btn-start 항상 초기 상태로 리셋 (showSessionCard가 바꿔놓을 수 있으므로)
  const btn = document.getElementById('btn-start');
  btn.onclick   = startWorkout;
  btn.disabled  = false;
  btn.style.opacity = '1';
  btn.textContent   = '시작하기 →';

  const idx      = STATE.currentIdx;
  const plan     = CURRICULUM[idx];
  const isDone   = STATE.completedIdx.includes(idx);

  // 주차/회차 표시 업데이트
  document.getElementById('home-week-label').textContent = `${plan.week}주차`;
  document.getElementById('home-progress-label').textContent =
    `${STATE.completedIdx.length} / ${TOTAL_SESSIONS} 완료`;

  // 주차 카드 목록 그리기
  drawWeekGrid();

  // 오늘 카드 vs 완료 카드
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
    document.getElementById('btn-start').textContent = '시작하기 →';
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-start').style.opacity = '1';
  }
}

// 9주 × 3회 그리드 그리기
function drawWeekGrid() {
  const grid = document.getElementById('week-grid');
  grid.innerHTML = '';

  for (let w = 1; w <= 9; w++) {
    const weekRow = document.createElement('div');
    weekRow.className = 'week-row';

    // 주차 레이블
    const weekLabel = document.createElement('div');
    weekLabel.className = 'week-label';
    weekLabel.textContent = `${w}주`;
    weekRow.appendChild(weekLabel);

    // 3개 세션 점
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'week-dots';

    for (let s = 1; s <= 3; s++) {
      const sesIdx = (w - 1) * 3 + (s - 1);
      const isDone   = STATE.completedIdx.includes(sesIdx);
      const isCurrent = sesIdx === STATE.currentIdx && !isDone;
      const isLocked = LOCK_ENABLED && sesIdx > STATE.currentIdx;

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

// 세션 점 클릭 시 카드 업데이트
function showSessionCard(sesIdx) {
  const plan    = CURRICULUM[sesIdx];
  const isDone  = STATE.completedIdx.includes(sesIdx);
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
    // 이 세션을 현재로 설정 후 시작 가능하게
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
   유틸 함수
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
  const mins    = Math.round(totalSeconds(plan.phases) / 60);
  const jogPhases = plan.phases.filter(p => p.type === 'jog');
  const jogCount  = jogPhases.length;

  if (jogCount === 1) {
    // 연속 달리기 (5주차 이후)
    return `총 ${mins}분 · 연속 조깅 ${fmtSec(jogPhases[0].duration)}`;
  }
  const jogSec  = jogPhases[0]?.duration || 0;
  const walkSec = plan.phases.find(p => p.type === 'walk')?.duration || 0;
  return `총 ${mins}분 · ${jogCount}세트 (조깅 ${fmtSec(jogSec)} + 걷기 ${fmtSec(walkSec)})`;
}


/* ====================================================
   ⑥ 운동 시작
   ==================================================== */

function startWorkout() {
  // btn-start onclick을 기본값으로 복원
  document.getElementById('btn-start').onclick = startWorkout;

  const plan = CURRICULUM[STATE.currentIdx];

  currentPhases   = plan.phases;
  currentPhaseIdx = 0;
  totalElapsed    = 0;
  totalDuration   = totalSeconds(currentPhases);
  remainingSec    = currentPhases[0].duration;

  saveWorkoutProgress(STATE.currentIdx, 0);
  renderTimerScreen();
  showScreen('screen-timer');

  timerInterval = setInterval(tick, 1000);
}


/* ====================================================
   ⑦ 타이머 화면 렌더링
   ==================================================== */

function renderTimerScreen() {
  const phase = currentPhases[currentPhaseIdx];

  document.getElementById('phase-label').textContent = phase.label;
  document.getElementById('phase-desc').textContent  = PHASE_LABELS[phase.type] || '';

  // 워밍업 구간일 때만 런닝 팁 표시
  const tipsEl = document.getElementById('running-tips');
  if (phase.type === 'warmup') {
    tipsEl.classList.remove('hidden');
  } else {
    tipsEl.classList.add('hidden');
  }

  // 구간 배경색 적용
  applyPhaseBackground(phase.type);

  if (document.getElementById('phase-map').children.length === 0) buildPhaseMap();
  updatePhaseMap();
  updateTimerDisplay(remainingSec);

  const pct = (totalElapsed / totalDuration) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('total-time-label').textContent =
    `총 ${Math.round(totalDuration / 60)}분`;

  const isLast = currentPhaseIdx === currentPhases.length - 1 && remainingSec <= 0;
  document.getElementById('btn-finish').classList.toggle('hidden', !isLast);
}

function buildPhaseMap() {
  const map = document.getElementById('phase-map');
  map.innerHTML = '';
  currentPhases.forEach((p, i) => {
    const chip = document.createElement('div');
    chip.className = `phase-chip ${PHASE_CHIP_CLASS[p.type] || ''}`;
    chip.id = `chip-${i}`;
    const ratio = p.duration / totalDuration;
    chip.style.flex = 1;
    map.appendChild(chip);
  });
}

function updatePhaseMap() {
  currentPhases.forEach((_, i) => {
    const chip = document.getElementById(`chip-${i}`);
    if (!chip) return;
    chip.classList.remove('active', 'done');
    if (i < currentPhaseIdx)       chip.classList.add('done');
    else if (i === currentPhaseIdx) chip.classList.add('active');
  });
}

function updateTimerDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  document.getElementById('timer-min').textContent = String(m).padStart(2, '0');
  document.getElementById('timer-sec').textContent = String(s).padStart(2, '0');
}


/* ====================================================
   ⑧ 타이머 틱
   ==================================================== */

function tick() {
  remainingSec--;
  totalElapsed++;

  if (remainingSec <= 0) {
    currentPhaseIdx++;

    if (currentPhaseIdx >= currentPhases.length) {
      clearInterval(timerInterval);
      currentPhaseIdx = currentPhases.length - 1;
      remainingSec = 0;
      renderTimerScreen();
      document.getElementById('btn-finish').classList.remove('hidden');
      vibrate([200, 100, 200]);
      return;
    }

    vibrate([100]);
    remainingSec = currentPhases[currentPhaseIdx].duration;
    saveWorkoutProgress(STATE.currentIdx, currentPhaseIdx);
  }

  renderTimerScreen();
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}


/* ====================================================
   ⑨ 운동 완료 + 피드백
   ==================================================== */

function finishWorkout() {
  clearInterval(timerInterval);
  timerInterval = null;
  clearPhaseBackground();
  clearWorkoutProgress();

  const plan = CURRICULUM[STATE.currentIdx];
  const isLastSessionOfWeek = plan.session === 3;

  // 팁 영역 숨기기
  document.getElementById('running-tips').classList.add('hidden');
  document.getElementById('phase-map').innerHTML = '';

  if (isLastSessionOfWeek) {
    // 3회차 완료 → 피드백 화면
    showFeedbackScreen(plan.week);
  } else {
    // 1~2회차 완료 → 바로 다음으로
    markSessionComplete(STATE.currentIdx);
  }
}

function showFeedbackScreen(week) {
  // 피드백 화면 초기화
  document.getElementById('feedback-title').textContent = `${week}주차 완료!`;
  document.getElementById('feedback-hard-confirm').classList.add('hidden');
  document.getElementById('feedback-easy-warning').classList.add('hidden');
  // 버튼들 다시 보이기
  document.querySelector('.feedback-buttons').classList.remove('hidden');
  document.querySelector('.feedback-sub').classList.remove('hidden');
  showScreen('screen-feedback');
}

function handleFeedback(type) {
  const plan = CURRICULUM[STATE.currentIdx];
  const week = plan.week;

  if (type === 'hard') {
    // 확인 메시지 표시
    document.querySelector('.feedback-buttons').classList.add('hidden');
    document.querySelector('.feedback-sub').classList.add('hidden');
    document.getElementById('confirm-msg').textContent =
      `${week}주차를 한 번 더 할까요?`;
    document.getElementById('feedback-hard-confirm').classList.remove('hidden');

  } else if (type === 'easy') {
    // 경고 문구 잠깐 보여주고 다음으로
    document.getElementById('feedback-easy-warning').classList.remove('hidden');
    setTimeout(() => {
      markSessionComplete(STATE.currentIdx);
    }, 2500);

  } else {
    // 적당 → 바로 다음으로
    markSessionComplete(STATE.currentIdx);
  }
}

function confirmRepeat() {
  // 이번 주차 1회차로 되돌아가기
  const plan   = CURRICULUM[STATE.currentIdx];
  const week   = plan.week;
  const firstIdxOfWeek = (week - 1) * 3; // 주차 첫 세션 인덱스

  // 이번 주차 완료 기록 제거
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

  // 전체 완료
  if (STATE.completedIdx.length >= TOTAL_SESSIONS) {
    saveState(STATE);
    showScreen('screen-complete');
    return;
  }

  // 다음 세션으로 이동
  let nextIdx = idx + 1;
  while (nextIdx < TOTAL_SESSIONS && STATE.completedIdx.includes(nextIdx)) {
    nextIdx++;
  }
  STATE.currentIdx = Math.min(nextIdx, TOTAL_SESSIONS - 1);
  saveState(STATE);
  renderHome();
}


/* ====================================================
   ⑩ 뒤로가기
   ==================================================== */

function goBack() {
  const confirmed = confirm('운동을 중단할까요?\n나가면 오늘 진행이 초기화돼요.');
  if (!confirmed) return;

  clearInterval(timerInterval);
  timerInterval = null;
  clearWorkoutProgress();
  clearPhaseBackground();
  document.getElementById('phase-map').innerHTML = '';
  renderHome();
}


/* ====================================================
   ⑪ 앱 초기화
   ==================================================== */

function resetApp() {
  localStorage.removeItem(APP_KEY);
  STATE = loadState();
  renderHome();
}


/* ====================================================
   ⑫ 진입점
   ==================================================== */
(function init() {
  const progress = loadWorkoutProgress();
  if (
    progress &&
    progress.idx === STATE.currentIdx &&
    !STATE.completedIdx.includes(progress.idx)
  ) {
    const plan = CURRICULUM[progress.idx];
    if (plan && plan.type === 'workout') {
      const phase = plan.phases[progress.phaseIdx];
      const resume = confirm(
        `이전에 ${plan.week}주차 ${plan.session}회차 운동 중이었어요.\n` +
        `"${phase?.label || ''}" 구간부터 이어서 할까요?`
      );
      if (resume) {
        currentPhases   = plan.phases;
        currentPhaseIdx = progress.phaseIdx;
        totalDuration   = totalSeconds(currentPhases);
        remainingSec    = currentPhases[currentPhaseIdx].duration;
        totalElapsed    = currentPhases
          .slice(0, currentPhaseIdx)
          .reduce((s, p) => s + p.duration, 0);

        // phase-map 초기화 (재개 시 buildPhaseMap이 실행되도록)
        document.getElementById('phase-map').innerHTML = '';

        renderTimerScreen();
        showScreen('screen-timer');
        timerInterval = setInterval(tick, 1000);
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