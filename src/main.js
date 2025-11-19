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
    console.log('🚀 initApp() 함수 시작!');
    logger.debug('비디오 플레이어 초기화 시작...');

    // Core 앱 초기화
    await app.init();
    console.log('✓ app.init() 완료');

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

    // MusicPlayer와 ShuffleEngine 연결
    musicPlayer.setShuffleEngine(shuffleEngine);

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

    // === 시작 버튼 설정 ===
    const startButton = document.getElementById('startButton');
    const controlPanel = document.querySelector('.control-panel');
    const titleDisplay = document.getElementById('titleDisplay');
    const controlCenter = document.getElementById('controlCenter');

    console.log('🔍 UI 요소 확인:', {
      startButton: !!startButton,
      controlPanel: !!controlPanel,
      titleDisplay: !!titleDisplay,
      controlCenter: !!controlCenter
    });

    if (startButton) {
      logger.debug('✓ 시작 버튼 찾음, 이벤트 리스너 추가');

      startButton.addEventListener('click', () => {
        console.log('🖱️ 시작 버튼 클릭됨!');

        // 시작 버튼 숨기기
        startButton.style.display = 'none';

        // UI 요소 표시
        if (controlPanel) {
          controlPanel.classList.add('show');
          console.log('✓ 컨트롤 패널 표시');
        }
        if (titleDisplay) {
          titleDisplay.classList.add('show');
          console.log('✓ 타이틀 디스플레이 표시');
        }
        if (controlCenter) {
          controlCenter.classList.add('show');
          console.log('✓ 컨트롤 센터 표시');
        }

        logger.info('🎬 비디오 플레이어 시작!');
      });
    } else {
      logger.error('❌ 시작 버튼을 찾을 수 없습니다!');
      console.error('startButton element not found!');
    }

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
    const playlistUI = app.getModule('playlistUI');

    if (musicPlayer) {
      musicPlayer.next();

      // PlaylistUI 실시간 동기화
      if (playlistUI) {
        playlistUI.setCurrentTrack(musicPlayer.currentIndex);
      }
    }
  });

  eventBus.on('music:previous', () => {
    const musicPlayer = app.getModule('musicPlayer');
    const playlistUI = app.getModule('playlistUI');

    if (musicPlayer) {
      musicPlayer.previous();

      // PlaylistUI 실시간 동기화
      if (playlistUI) {
        playlistUI.setCurrentTrack(musicPlayer.currentIndex);
      }
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

  // 반복 모드 순환
  eventBus.on('repeat:cycle', () => {
    const shuffleEngine = app.getModule('shuffleEngine');
    if (shuffleEngine) {
      shuffleEngine.cycleRepeatMode();
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
    const playlistUI = app.getModule('playlistUI');

    if (musicPlayer) {
      // 인덱스 동기화
      if (index !== undefined) {
        musicPlayer.currentIndex = index;
      }

      musicPlayer.loadTrack(track);
      musicPlayer.play();

      // PlaylistUI 업데이트
      if (playlistUI && index !== undefined) {
        playlistUI.setCurrentTrack(index);
      }
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

  // 효과음 버튼 이벤트 리스너 설정
  const effectButtons = {
    'effectRain': 'rain',
    'effectBird': 'bird',
    'effectForest': 'forest',
    'effectCrickets': 'crickets',
    'effectStream': 'stream',
    'effectWind': 'wind',
    'effectCrackle': 'crackle',
    'effectSand': 'sand'
  };

  Object.entries(effectButtons).forEach(([buttonId, effectName]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', () => {
        const effectPlayer = app.getModule('effectPlayer');
        if (effectPlayer) {
          effectPlayer.toggle(effectName);
          button.classList.toggle('active');
          logger.debug(`효과음 토글: ${effectName}`);
        }
      });
    }
  });

  // 플레이 버튼 이벤트
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      eventBus.emit('music:toggle');
    });
  }

  // 다음 버튼 이벤트
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      eventBus.emit('music:next');
    });
  }

  // 이전 버튼 이벤트
  const shuffleBtn = document.getElementById('shuffleBtn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      eventBus.emit('music:previous');
    });
  }

  // === 드래그 앤 드롭 & 파일 업로드 ===
  const dropZone = document.getElementById('dropZone');
  const audioFileInput = document.getElementById('audioFileInput');
  const musicPlayer = app.getModule('musicPlayer');
  const trackLoader = app.getModule('trackLoader');
  const playlistUI = app.getModule('playlistUI');

  // 드래그 앤 드롭 이벤트
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'rgba(79, 195, 247, 0.8)';
      dropZone.style.backgroundColor = 'rgba(79, 195, 247, 0.1)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'rgba(255,255,255,0.3)';
      dropZone.style.backgroundColor = 'transparent';
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'rgba(255,255,255,0.3)';
      dropZone.style.backgroundColor = 'transparent';

      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('audio/')
      );

      if (files.length > 0 && trackLoader) {
        await handleAudioFiles(files);
      }
    });
  }

  // 파일 입력 이벤트
  if (audioFileInput) {
    audioFileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);

      if (files.length > 0 && trackLoader) {
        await handleAudioFiles(files);
      }

      // 입력 초기화 (같은 파일 다시 선택 가능하도록)
      e.target.value = '';
    });
  }

  // === 오버레이 이벤트 핸들러 ===
  const overlayManager = app.getModule('overlayManager');

  if (overlayManager) {
    // 오버레이 1
    const overlay1Enabled = document.getElementById('overlay1Enabled');
    const overlay1OpacitySlider = document.getElementById('overlay1-opacity-slider');
    const overlay1OpacityValue = document.getElementById('overlay1-opacity-value');
    const overlay1BlendMode = document.getElementById('overlay1BlendMode');
    const overlay1Reset = document.getElementById('overlay1Reset');

    if (overlay1Enabled) {
      overlay1Enabled.addEventListener('change', (e) => {
        overlayManager.setEnabled(1, e.target.checked);
      });
    }

    if (overlay1OpacitySlider && overlay1OpacityValue) {
      overlay1OpacitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        overlay1OpacityValue.textContent = `${value}%`;
        overlayManager.setOpacity(1, value / 100);
      });
    }

    if (overlay1BlendMode) {
      overlay1BlendMode.addEventListener('change', (e) => {
        overlayManager.setBlendMode(1, e.target.value);
      });
    }

    if (overlay1Reset) {
      overlay1Reset.addEventListener('click', () => {
        overlayManager.reset(1);
        if (overlay1Enabled) overlay1Enabled.checked = false;
        if (overlay1OpacitySlider) overlay1OpacitySlider.value = 30;
        if (overlay1OpacityValue) overlay1OpacityValue.textContent = '30%';
        if (overlay1BlendMode) overlay1BlendMode.value = 'screen';
      });
    }

    // 오버레이 2
    const overlay2Enabled = document.getElementById('overlay2Enabled');
    const overlay2OpacitySlider = document.getElementById('overlay2-opacity-slider');
    const overlay2OpacityValue = document.getElementById('overlay2-opacity-value');
    const overlay2BlendMode = document.getElementById('overlay2BlendMode');
    const overlay2Reset = document.getElementById('overlay2Reset');

    if (overlay2Enabled) {
      overlay2Enabled.addEventListener('change', (e) => {
        overlayManager.setEnabled(2, e.target.checked);
      });
    }

    if (overlay2OpacitySlider && overlay2OpacityValue) {
      overlay2OpacitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        overlay2OpacityValue.textContent = `${value}%`;
        overlayManager.setOpacity(2, value / 100);
      });
    }

    if (overlay2BlendMode) {
      overlay2BlendMode.addEventListener('change', (e) => {
        overlayManager.setBlendMode(2, e.target.value);
      });
    }

    if (overlay2Reset) {
      overlay2Reset.addEventListener('click', () => {
        overlayManager.reset(2);
        if (overlay2Enabled) overlay2Enabled.checked = false;
        if (overlay2OpacitySlider) overlay2OpacitySlider.value = 30;
        if (overlay2OpacityValue) overlay2OpacityValue.textContent = '30%';
        if (overlay2BlendMode) overlay2BlendMode.value = 'screen';
      });
    }

    // 오버레이 3
    const overlay3Enabled = document.getElementById('overlay3Enabled');
    const overlay3OpacitySlider = document.getElementById('overlay3-opacity-slider');
    const overlay3OpacityValue = document.getElementById('overlay3-opacity-value');
    const overlay3BlendMode = document.getElementById('overlay3BlendMode');
    const overlay3Reset = document.getElementById('overlay3Reset');

    if (overlay3Enabled) {
      overlay3Enabled.addEventListener('change', (e) => {
        overlayManager.setEnabled(3, e.target.checked);
      });
    }

    if (overlay3OpacitySlider && overlay3OpacityValue) {
      overlay3OpacitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        overlay3OpacityValue.textContent = `${value}%`;
        overlayManager.setOpacity(3, value / 100);
      });
    }

    if (overlay3BlendMode) {
      overlay3BlendMode.addEventListener('change', (e) => {
        overlayManager.setBlendMode(3, e.target.value);
      });
    }

    if (overlay3Reset) {
      overlay3Reset.addEventListener('click', () => {
        overlayManager.reset(3);
        if (overlay3Enabled) overlay3Enabled.checked = false;
        if (overlay3OpacitySlider) overlay3OpacitySlider.value = 30;
        if (overlay3OpacityValue) overlay3OpacityValue.textContent = '30%';
        if (overlay3BlendMode) overlay3BlendMode.value = 'screen';
      });
    }
  }

  // 오디오 파일 처리 함수
  async function handleAudioFiles(files) {
    logger.info(`${files.length}개 오디오 파일 로드 중...`);

    const tracks = [];

    for (const file of files) {
      try {
        const track = await trackLoader.loadAudioFile(file);
        tracks.push(track);
        logger.debug(`파일 로드 완료: ${file.name}`);
      } catch (error) {
        logger.error(`파일 로드 실패: ${file.name} - ${error.message}`);
      }
    }

    if (tracks.length > 0) {
      // 현재 플레이리스트에 추가
      const currentPlaylist = musicPlayer.playlist || [];
      const newPlaylist = [...currentPlaylist, ...tracks];

      musicPlayer.setPlaylist(newPlaylist);

      if (playlistUI) {
        playlistUI.setPlaylist(newPlaylist);
      }

      logger.info(`✅ ${tracks.length}개 트랙 추가됨`);
    }
  }
}

// 전역 에러 핸들러
window.addEventListener('error', (event) => {
  console.error('🚨 전역 에러:', event.error);
  console.error('파일:', event.filename, '라인:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 처리되지 않은 Promise 거부:', event.reason);
});

// DOM이 로드되면 앱 초기화
if (document.readyState === 'loading') {
  console.log('⏳ DOM 로딩 중... DOMContentLoaded 대기');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('✓ DOM 이미 로드됨, initApp() 즉시 실행');
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
    on: (event, callback) => eventBus.on(event, callback),
    checkElements: () => {
      const elements = {
        startButton: !!document.getElementById('startButton'),
        controlPanel: !!document.querySelector('.control-panel'),
        titleDisplay: !!document.getElementById('titleDisplay'),
        controlCenter: !!document.getElementById('controlCenter'),
        playBtn: !!document.getElementById('playBtn'),
        nextBtn: !!document.getElementById('nextBtn'),
        shuffleBtn: !!document.getElementById('shuffleBtn')
      };
      console.log('🔍 UI 요소 체크:', elements);
      return elements;
    }
  };

  logger.info('전역 객체 window.videoPlayer 사용 가능');
  logger.info('디버깅: window.videoPlayer.debug.listModules()');
}
