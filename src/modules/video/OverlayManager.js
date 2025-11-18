/**
 * 오버레이 비디오 관리
 */

import { CONFIG } from '../../config/constants.js';
import { DOM } from '../../core/dom.js';
import { logger } from '../../core/logger.js';

export class OverlayManager {
  constructor() {
    this.video = null;
    this.enabled = false;
    this.opacity = CONFIG.OPACITY.DEFAULT_OVERLAY;
    this.blendMode = 'screen';
  }

  init() {
    this.video = DOM.overlay.video;
    if (!this.video) {
      logger.error('Overlay video element not found');
      return false;
    }

    // 초기 설정
    this.video.loop = true;
    this.video.muted = true;
    this.video.style.mixBlendMode = this.blendMode;

    return true;
  }

  setOpacity(opacity) {
    this.opacity = opacity / 100;
    if (this.video && this.enabled) {
      this.video.style.opacity = this.opacity;
    }
  }

  setBlendMode(mode) {
    this.blendMode = mode;
    if (this.video) {
      this.video.style.mixBlendMode = mode;
    }
  }

  enable() {
    this.enabled = true;
    if (this.video) {
      this.video.style.opacity = this.opacity;
      if (this.video.paused && this.video.src) {
        this.video.play().catch(err => logger.error('Overlay play failed:', err));
      }
    }
  }

  disable() {
    this.enabled = false;
    if (this.video) {
      this.video.style.opacity = 0;
    }
  }

  loadVideo(url) {
    if (!this.video) return;

    this.video.src = url;
    this.video.load();

    if (this.enabled) {
      this.video.play().catch(err => logger.error('Overlay video play failed:', err));
    }
  }

  destroy() {
    if (this.video) {
      this.video.pause();
      this.video.src = '';
    }
  }
}
