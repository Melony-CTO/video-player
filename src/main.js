/**
 * 비디오 플레이어 메인 엔트리 포인트
 * 모든 모듈을 통합하고 초기화
 */

// Core 모듈
import { app } from './core/app.js';
import { logger } from './core/logger.js';
import { eventBus } from './core/events.js';

// Video 모듈
import { OverlayManager } from './modules/video/OverlayManager.js';

// Audio 모듈
import { MusicPlayer } from './modules/audio/MusicPlayer.js';
import { EffectPlayer } from './modules/audio/EffectPlayer.js';
import { Equalizer } from './modules/audio/Equalizer.js';
import { AudioAnalyzer } from './modules/audio/AudioAnalyzer.js';
import { VolumeManager } from './modules/audio/VolumeManager.js';

// Playlist 모듈
import { PlaylistManager } from './modules/playlist/PlaylistManager.js';
import { TrackLoader } from './modules/playlist/TrackLoader.js';
import { ShuffleEngine } from './modules/playlist/ShuffleEngine.js';

// UI 모듈
import { Visualizer } from './modules/ui/Visualizer.js';
import { PlaylistUI } from './modules/ui/PlaylistUI.js';

// Features 모듈
import { StealthMode } from './modules/features/StealthMode.js';
import { PresetSystem } from './modules/features/PresetSystem.js';
import { KeyboardShortcuts } from './modules/features/KeyboardShortcuts.js';

/**
 * 앱 초기화 및 시작
 */
async function initApp() {
  try {
    logger.debug('비디오 플레이어 초기화 시작...');

    // Core 앱 초기화
    await app.init();

    // === Audio 모듈 초기화 ===
    const musicPlayer = new MusicPlayer();
    const effectPlayer = new EffectPlayer();
    const volumeManager = new VolumeManager();

    app.registerModule('musicPlayer', musicPlayer);
    app.registerModule('effectPlayer', effectPlayer);
    app.registerModule('volumeManager', volumeManager);

    if (musicPlayer.init()) {
      logger.debug('✓ MusicPlayer 초기화');
    }
    if (effectPlayer.init()) {
      logger.debug('✓ EffectPlayer 초기화');
    }
    if (volumeManager.init()) {
      logger.debug('✓ VolumeManager 초기화');
    }

    // Equalizer & AudioAnalyzer (Web Audio API 필요)
    if (musicPlayer.player) {
      const equalizer = new Equalizer();
      const audioAnalyzer = new AudioAnalyzer();

      app.registerModule('equalizer', equalizer);
      app.registerModule('audioAnalyzer', audioAnalyzer);

      if (equalizer.init(musicPlayer.player)) {
        logger.debug('✓ Equalizer 초기화');
      }
      if (audioAnalyzer.init(musicPlayer.player)) {
        logger.debug('✓ AudioAnalyzer 초기화');
        audioAnalyzer.start();
      }
    }

    // === Playlist 모듈 초기화 ===
    const playlistManager = new PlaylistManager();
    const trackLoader = new TrackLoader();
    const shuffleEngine = new ShuffleEngine();

    app.registerModule('playlistManager', playlistManager);
    app.registerModule('trackLoader', trackLoader);
    app.registerModule('shuffleEngine', shuffleEngine);

    if (playlistManager.init()) {
      logger.debug('✓ PlaylistManager 초기화');
    }
    if (trackLoader.init()) {
      logger.debug('✓ TrackLoader 초기화');
    }
    if (shuffleEngine.init()) {
      logger.debug('✓ ShuffleEngine 초기화');
    }

    // === UI 모듈 초기화 ===
    const visualizer = new Visualizer();
    const playlistUI = new PlaylistUI();

    app.registerModule('visualizer', visualizer);
    app.registerModule('playlistUI', playlistUI);

    if (visualizer.init()) {
      logger.debug('✓ Visualizer 초기화');
    }
    if (playlistUI.init()) {
      logger.debug('✓ PlaylistUI 초기화');
    }

    // === Video 모듈 초기화 ===
    const overlayManager = new OverlayManager();
    app.registerModule('overlayManager', overlayManager);

    if (overlayManager.init()) {
      logger.debug('✓ OverlayManager 초기화');
    }

    // === Features 모듈 초기화 ===
    const stealthMode = new StealthMode();
    const presetSystem = new PresetSystem();
    const keyboardShortcuts = new KeyboardShortcuts();

    app.registerModule('stealthMode', stealthMode);
    app.registerModule('presetSystem', presetSystem);
    app.registerModule('keyboardShortcuts', keyboardShortcuts);

    if (stealthMode.init()) {
      logger.debug('✓ StealthMode 초기화');
    }
    if (presetSystem.init()) {
      logger.debug('✓ PresetSystem 초기화');
    }
    if (keyboardShortcuts.init()) {
      logger.debug('✓ KeyboardShortcuts 초기화');
    }

    // === 이벤트 연결 ===
    setupEventHandlers();

    // 앱 시작
    await app.start();

    logger.info('✅ 비디오 플레이어가 성공적으로 초기화되었습니다!');
    logger.info('📦 로드된 모듈: ' + Object.keys(app.modules).length + '개');

  } catch (error) {
    logger.error(`앱 초기화 실패: ${error.message}`);
    console.error(error);
  }
}

/**
 * 이벤트 핸들러 설정
 */
function setupEventHandlers() {
  // 음악 재생 토글
  eventBus.on('music:toggle', () => {
    const musicPlayer = app.getModule('musicPlayer');
    if (musicPlayer) {
      musicPlayer.toggle();
    }
  });

  // 다음/이전 트랙
  eventBus.on('music:next', () => {
    const musicPlayer = app.getModule('musicPlayer');
    if (musicPlayer) {
      musicPlayer.next();
    }
  });

  eventBus.on('music:previous', () => {
    const musicPlayer = app.getModule('musicPlayer');
    if (musicPlayer) {
      musicPlayer.previous();
    }
  });

  // 볼륨 조절
  eventBus.on('volume:increase', () => {
    const volumeManager = app.getModule('volumeManager');
    if (volumeManager) {
      volumeManager.increaseVolume();
    }
  });

  eventBus.on('volume:decrease', () => {
    const volumeManager = app.getModule('volumeManager');
    if (volumeManager) {
      volumeManager.decreaseVolume();
    }
  });

  eventBus.on('volume:toggleMute', () => {
    const volumeManager = app.getModule('volumeManager');
    if (volumeManager) {
      volumeManager.toggleMute();
    }
  });

  // 셔플 토글
  eventBus.on('shuffle:toggle', () => {
    const shuffleEngine = app.getModule('shuffleEngine');
    if (shuffleEngine) {
      shuffleEngine.toggle();
    }
  });

  // 스텔스 모드 토글
  eventBus.on('stealth:toggle', () => {
    const stealthMode = app.getModule('stealthMode');
    if (stealthMode) {
      stealthMode.toggle();
    }
  });

  // UI 트랙 선택
  eventBus.on('ui:track:selected', ({ track, index }) => {
    const musicPlayer = app.getModule('musicPlayer');
    if (musicPlayer) {
      musicPlayer.loadTrack(track);
      musicPlayer.play();
    }
  });

  // 볼륨 변경 -> MusicPlayer에 적용
  eventBus.on('volume:music:changed', (volume) => {
    const musicPlayer = app.getModule('musicPlayer');
    if (musicPlayer) {
      musicPlayer.setVolume(volume);
    }
  });

  // 볼륨 변경 -> EffectPlayer에 적용
  eventBus.on('volume:effects:changed', (volume) => {
    const effectPlayer = app.getModule('effectPlayer');
    if (effectPlayer) {
      effectPlayer.setMasterVolume(volume);
    }
  });
}

// DOM이 로드되면 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 전역 객체로 export (디버깅용)
if (typeof window !== 'undefined') {
  window.videoPlayer = {
    app,
    logger,
    eventBus,
    // 디버깅을 위한 모듈 접근
    getModule: (name) => app.getModule(name)
  };

  // 개발 모드에서 유용한 헬퍼 함수들
  window.videoPlayer.debug = {
    listModules: () => {
      console.log('로드된 모듈:', Object.keys(app.modules));
      return Object.keys(app.modules);
    },
    getModule: (name) => app.getModule(name),
    emit: (event, data) => eventBus.emit(event, data),
    on: (event, callback) => eventBus.on(event, callback)
  };

  logger.info('전역 객체 window.videoPlayer 사용 가능');
  logger.info('디버깅: window.videoPlayer.debug.listModules()');
}
