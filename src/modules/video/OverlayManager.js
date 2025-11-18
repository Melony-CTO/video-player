/**
 * 오버레이 관리 모듈
 * 3개의 독립적인 비디오 오버레이 관리
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class OverlayManager {
  constructor() {
    this.overlays = [
      {
        id: 1,
        video: null,
        enabled: false,
        opacity: 0.3,
        blendMode: 'screen',
        videoSrc: ''
      },
      {
        id: 2,
        video: null,
        enabled: false,
        opacity: 0.3,
        blendMode: 'screen',
        videoSrc: ''
      },
      {
        id: 3,
        video: null,
        enabled: false,
        opacity: 0.3,
        blendMode: 'screen',
        videoSrc: ''
      }
    ];

    this.blendModes = [
      'normal',
      'multiply',
      'screen',
      'overlay',
      'darken',
      'lighten',
      'color-dodge',
      'color-burn',
      'hard-light',
      'soft-light',
      'difference',
      'exclusion',
      'hue',
      'saturation',
      'color',
      'luminosity'
    ];
  }

  init() {
    // 비디오 요소 연결
    this.overlays.forEach((overlay, index) => {
      const videoElement = document.getElementById(`overlay${overlay.id}`);

      if (videoElement) {
        overlay.video = videoElement;
        this.applyOverlaySettings(overlay.id);
      } else {
        logger.warning(`오버레이 ${overlay.id} 비디오 요소를 찾을 수 없음`);
      }
    });

    logger.info('오버레이 매니저 초기화 완료');
    return true;
  }

  // 오버레이 활성화/비활성화
  setEnabled(overlayId, enabled) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay) return;

    overlay.enabled = enabled;

    if (overlay.video) {
      if (enabled) {
        overlay.video.style.display = 'block';
        overlay.video.style.opacity = overlay.opacity;

        // 비디오 소스가 있으면 재생
        if (overlay.videoSrc && overlay.video.src !== overlay.videoSrc) {
          overlay.video.src = overlay.videoSrc;
        }

        overlay.video.play().catch(err => {
          logger.error(`오버레이 ${overlayId} 재생 실패: ${err.message}`);
        });
      } else {
        overlay.video.style.display = 'none';
        overlay.video.pause();
      }
    }

    eventBus.emit('overlay:enabled:changed', { overlayId, enabled });
    logger.info(`오버레이 ${overlayId}: ${enabled ? '활성화' : '비활성화'}`);
  }

  // 투명도 설정
  setOpacity(overlayId, opacity) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay) return;

    overlay.opacity = Math.max(0, Math.min(1, opacity));

    if (overlay.video && overlay.enabled) {
      overlay.video.style.opacity = overlay.opacity;
    }

    eventBus.emit('overlay:opacity:changed', { overlayId, opacity: overlay.opacity });
    logger.debug(`오버레이 ${overlayId} 투명도: ${Math.round(overlay.opacity * 100)}%`);
  }

  // 블렌드 모드 설정
  setBlendMode(overlayId, blendMode) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay) return;

    if (!this.blendModes.includes(blendMode)) {
      logger.warning(`유효하지 않은 블렌드 모드: ${blendMode}`);
      return;
    }

    overlay.blendMode = blendMode;

    if (overlay.video) {
      overlay.video.style.mixBlendMode = blendMode;
    }

    eventBus.emit('overlay:blend:changed', { overlayId, blendMode });
    logger.info(`오버레이 ${overlayId} 블렌드 모드: ${blendMode}`);
  }

  // 비디오 소스 설정
  setVideoSource(overlayId, videoSrc) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay) return;

    overlay.videoSrc = videoSrc;

    if (overlay.video && overlay.enabled) {
      overlay.video.src = videoSrc;
      overlay.video.load();
      overlay.video.play().catch(err => {
        logger.error(`오버레이 ${overlayId} 비디오 로드 실패: ${err.message}`);
      });
    }

    logger.info(`오버레이 ${overlayId} 비디오 소스 설정: ${videoSrc}`);
  }

  // 오버레이 초기화
  reset(overlayId) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay) return;

    // 비디오 정지 및 초기화
    if (overlay.video) {
      overlay.video.pause();
      overlay.video.src = '';
      overlay.video.style.display = 'none';
      overlay.video.style.opacity = '0.3';
      overlay.video.style.mixBlendMode = 'screen';
    }

    // 설정 초기화
    overlay.enabled = false;
    overlay.opacity = 0.3;
    overlay.blendMode = 'screen';
    overlay.videoSrc = '';

    eventBus.emit('overlay:reset', { overlayId });
    logger.info(`오버레이 ${overlayId} 초기화 완료`);
  }

  // 모든 오버레이 초기화
  resetAll() {
    this.overlays.forEach(overlay => {
      this.reset(overlay.id);
    });

    logger.info('모든 오버레이 초기화 완료');
  }

  // 오버레이 설정 적용
  applyOverlaySettings(overlayId) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay || !overlay.video) return;

    overlay.video.style.opacity = overlay.opacity;
    overlay.video.style.mixBlendMode = overlay.blendMode;
    overlay.video.style.display = overlay.enabled ? 'block' : 'none';
    overlay.video.loop = true;
    overlay.video.muted = true;
  }

  // 오버레이 가져오기
  getOverlay(overlayId) {
    const overlay = this.overlays.find(o => o.id === overlayId);

    if (!overlay) {
      logger.error(`오버레이 ID ${overlayId}를 찾을 수 없음`);
      return null;
    }

    return overlay;
  }

  // 오버레이 상태 가져오기
  getOverlayState(overlayId) {
    const overlay = this.getOverlay(overlayId);
    if (!overlay) return null;

    return {
      id: overlay.id,
      enabled: overlay.enabled,
      opacity: overlay.opacity,
      blendMode: overlay.blendMode,
      videoSrc: overlay.videoSrc
    };
  }

  // 모든 오버레이 상태 가져오기
  getAllStates() {
    return this.overlays.map(overlay => ({
      id: overlay.id,
      enabled: overlay.enabled,
      opacity: overlay.opacity,
      blendMode: overlay.blendMode,
      videoSrc: overlay.videoSrc
    }));
  }

  // 블렌드 모드 목록 가져오기
  getBlendModes() {
    return [...this.blendModes];
  }

  destroy() {
    this.resetAll();
    this.overlays.forEach(overlay => {
      overlay.video = null;
    });

    logger.info('오버레이 매니저 정리 완료');
  }
}
