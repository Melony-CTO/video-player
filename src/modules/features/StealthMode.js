/**
 * 스텔스 모드 모듈
 * UI 요소들의 투명도와 호버 효과를 조절
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class StealthMode {
  constructor() {
    this.isActive = false;
    this.settings = {
      panelOpacity: 0.3,
      buttonOpacity: 1.0,
      blurAmount: 20,
      hoverEnabled: true
    };
    this.elements = {
      panel: null,
      buttons: []
    };
  }

  init() {
    // UI 요소 찾기
    this.elements.panel = document.getElementById('controlCenter');
    this.elements.buttons = Array.from(document.querySelectorAll('.control-panel, .title-display'));

    if (!this.elements.panel) {
      logger.warning('스텔스 모드: 패널 요소를 찾을 수 없음');
    }

    logger.info('스텔스 모드 초기화 완료');
    return true;
  }

  enable() {
    this.isActive = true;
    this.apply();

    logger.info('스텔스 모드 활성화');
    eventBus.emit('stealth:enabled');
  }

  disable() {
    this.isActive = false;
    this.reset();

    logger.info('스텔스 모드 비활성화');
    eventBus.emit('stealth:disabled');
  }

  toggle() {
    if (this.isActive) {
      this.disable();
    } else {
      this.enable();
    }

    return this.isActive;
  }

  apply() {
    // 패널 스타일 적용
    if (this.elements.panel) {
      this.elements.panel.style.opacity = this.settings.panelOpacity;
      this.elements.panel.style.backdropFilter = `blur(${this.settings.blurAmount}px)`;

      // 호버 효과
      if (this.settings.hoverEnabled) {
        this.elements.panel.addEventListener('mouseenter', this.handleHoverEnter.bind(this));
        this.elements.panel.addEventListener('mouseleave', this.handleHoverLeave.bind(this));
      }
    }

    // 버튼 투명도 적용
    this.elements.buttons.forEach(button => {
      button.style.opacity = this.settings.buttonOpacity;
    });
  }

  reset() {
    // 패널 스타일 리셋
    if (this.elements.panel) {
      this.elements.panel.style.opacity = '';
      this.elements.panel.style.backdropFilter = '';
      this.elements.panel.removeEventListener('mouseenter', this.handleHoverEnter);
      this.elements.panel.removeEventListener('mouseleave', this.handleHoverLeave);
    }

    // 버튼 투명도 리셋
    this.elements.buttons.forEach(button => {
      button.style.opacity = '';
    });
  }

  handleHoverEnter() {
    if (this.elements.panel) {
      this.elements.panel.style.opacity = '0.95';
      this.elements.panel.style.transition = 'opacity 0.3s ease';
    }
  }

  handleHoverLeave() {
    if (this.elements.panel) {
      this.elements.panel.style.opacity = this.settings.panelOpacity;
    }
  }

  // 개별 설정 변경
  setPanelOpacity(opacity) {
    this.settings.panelOpacity = Math.max(0, Math.min(1, opacity));

    if (this.isActive && this.elements.panel) {
      this.elements.panel.style.opacity = this.settings.panelOpacity;
    }

    eventBus.emit('stealth:setting:changed', { type: 'panelOpacity', value: this.settings.panelOpacity });
  }

  setButtonOpacity(opacity) {
    this.settings.buttonOpacity = Math.max(0, Math.min(1, opacity));

    if (this.isActive) {
      this.elements.buttons.forEach(button => {
        button.style.opacity = this.settings.buttonOpacity;
      });
    }

    eventBus.emit('stealth:setting:changed', { type: 'buttonOpacity', value: this.settings.buttonOpacity });
  }

  setBlurAmount(amount) {
    this.settings.blurAmount = Math.max(0, amount);

    if (this.isActive && this.elements.panel) {
      this.elements.panel.style.backdropFilter = `blur(${this.settings.blurAmount}px)`;
    }

    eventBus.emit('stealth:setting:changed', { type: 'blurAmount', value: this.settings.blurAmount });
  }

  setHoverEnabled(enabled) {
    this.settings.hoverEnabled = enabled;

    if (this.isActive) {
      if (enabled) {
        this.elements.panel.addEventListener('mouseenter', this.handleHoverEnter.bind(this));
        this.elements.panel.addEventListener('mouseleave', this.handleHoverLeave.bind(this));
      } else {
        this.elements.panel.removeEventListener('mouseenter', this.handleHoverEnter);
        this.elements.panel.removeEventListener('mouseleave', this.handleHoverLeave);
      }
    }

    eventBus.emit('stealth:setting:changed', { type: 'hoverEnabled', value: enabled });
  }

  // 프리셋 적용
  applyPreset(presetName) {
    const presets = {
      ninja: {
        panelOpacity: 0.1,
        buttonOpacity: 0.3,
        blurAmount: 10,
        hoverEnabled: true
      },
      ghost: {
        panelOpacity: 0.05,
        buttonOpacity: 0.15,
        blurAmount: 5,
        hoverEnabled: true
      },
      hover: {
        panelOpacity: 0.3,
        buttonOpacity: 0.5,
        blurAmount: 20,
        hoverEnabled: true
      }
    };

    const preset = presets[presetName];
    if (preset) {
      this.settings = { ...preset };
      if (this.isActive) {
        this.apply();
      }

      logger.info(`스텔스 프리셋 적용: ${presetName}`);
      eventBus.emit('stealth:preset:applied', presetName);
    } else {
      logger.warning(`알 수 없는 프리셋: ${presetName}`);
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  isEnabled() {
    return this.isActive;
  }

  destroy() {
    this.disable();
    this.elements = { panel: null, buttons: [] };
  }
}
