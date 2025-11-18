/**
 * 비디오 플레이어 메인 엔트리 포인트
 */

import { app } from './core/app.js';
import { logger } from './core/logger.js';
import { eventBus } from './core/events.js';
import { OverlayManager } from './modules/video/OverlayManager.js';

// 앱 초기화 및 시작
async function initApp() {
  try {
    logger.debug('Initializing video player...');

    // 앱 초기화
    await app.init();

    // 모듈 등록
    const overlayManager = new OverlayManager();
    app.registerModule('overlayManager', overlayManager);

    // 모듈 초기화
    if (overlayManager.init()) {
      logger.debug('Overlay manager initialized');
    }

    // 앱 시작
    await app.start();

    logger.info('✅ 비디오 플레이어가 성공적으로 초기화되었습니다');

  } catch (error) {
    logger.error(`앱 초기화 실패: ${error.message}`);
    console.error(error);
  }
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
    eventBus
  };
}
