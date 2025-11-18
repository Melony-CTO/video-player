/**
 * 애플리케이션 전역 상수 정의
 */

export const DEBUG = false; // 프로덕션에서는 false

export const CONFIG = {
  OPACITY: {
    DEFAULT_OVERLAY: 0.2,
    DEFAULT_INTRO: 0.3,
    DEFAULT_PANEL: 0.3
  },

  TIMING: {
    FADE_SLOW: 1000,        // 1s
    FADE_MEDIUM: 500,       // 0.5s
    FADE_FAST: 300,         // 0.3s
    AUDIO_FADE: 500,
    LOADER_DELAY: 100
  },

  PATHS: {
    DEFAULT_INTRO: '02_video/Intro/인트로.m4v',
    DEFAULT_LOOP1: 'Loof_01.mp4',
    DEFAULT_LOOP2: 'Loof_01-1.mp4',
    DEFAULT_OVERLAY: 'overlay01.mp4'
  },

  COLORS: {
    PRIMARY: '#4FC3F7',
    SUCCESS: '#4CAF50',
    ERROR: '#E57373',
    WARNING: '#FFB74D'
  }
};
