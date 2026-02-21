/**
 * 볼륨 관리 모듈
 * 마스터 볼륨과 개별 볼륨을 통합 관리
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';
import { clamp01 } from '../../utils/domUtils.js';

export class VolumeManager {
  constructor() {
    this.masterVolume = 0.5;
    this.musicVolume = 0.5;
    this.effectsVolume = 0.5;
    this.muted = false;
    this.previousVolume = 0.5;
  }

  init() {
    // 이벤트 리스너 설정
    this.setupEventListeners();

    logger.info('볼륨 관리자 초기화 완료');
    return true;
  }

  setupEventListeners() {
    // 볼륨 변경 이벤트 구독
    eventBus.on('volume:change', (data) => {
      this.handleVolumeChange(data);
    });
  }

  handleVolumeChange(data) {
    const { type, value } = data;

    switch (type) {
      case 'master':
        this.setMasterVolume(value);
        break;
      case 'music':
        this.setMusicVolume(value);
        break;
      case 'effects':
        this.setEffectsVolume(value);
        break;
      default:
        logger.warning(`알 수 없는 볼륨 타입: ${type}`);
    }
  }

  setMasterVolume(volume) {
    const normalizedVolume = clamp01(volume);
    this.masterVolume = normalizedVolume;

    logger.info(`마스터 볼륨: ${Math.round(normalizedVolume * 100)}%`);
    eventBus.emit('volume:master:changed', normalizedVolume);

    // 다른 모듈에도 알림
    eventBus.emit('volume:update', {
      master: this.masterVolume,
      music: this.musicVolume,
      effects: this.effectsVolume
    });
  }

  setMusicVolume(volume) {
    const normalizedVolume = clamp01(volume);
    this.musicVolume = normalizedVolume;

    const effectiveVolume = this.musicVolume * this.masterVolume;

    logger.debug(`음악 볼륨: ${Math.round(normalizedVolume * 100)}% (실제: ${Math.round(effectiveVolume * 100)}%)`);
    eventBus.emit('volume:music:changed', effectiveVolume);
  }

  setEffectsVolume(volume) {
    const normalizedVolume = clamp01(volume);
    this.effectsVolume = normalizedVolume;

    const effectiveVolume = this.effectsVolume * this.masterVolume;

    logger.debug(`효과음 볼륨: ${Math.round(normalizedVolume * 100)}% (실제: ${Math.round(effectiveVolume * 100)}%)`);
    eventBus.emit('volume:effects:changed', effectiveVolume);
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getEffectsVolume() {
    return this.effectsVolume;
  }

  getEffectiveMusicVolume() {
    return this.musicVolume * this.masterVolume;
  }

  getEffectiveEffectsVolume() {
    return this.effectsVolume * this.masterVolume;
  }

  mute() {
    if (this.muted) return;

    this.previousVolume = this.masterVolume;
    this.setMasterVolume(0);
    this.muted = true;

    logger.info('🔇 음소거');
    eventBus.emit('volume:muted', true);
  }

  unmute() {
    if (!this.muted) return;

    this.setMasterVolume(this.previousVolume);
    this.muted = false;

    logger.info('🔊 음소거 해제');
    eventBus.emit('volume:muted', false);
  }

  toggleMute() {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  isMuted() {
    return this.muted;
  }

  // 볼륨 증가 (10% 단위)
  increaseVolume() {
    this.setMasterVolume(clamp01(this.masterVolume + 0.1));
  }

  // 볼륨 감소 (10% 단위)
  decreaseVolume() {
    this.setMasterVolume(clamp01(this.masterVolume - 0.1));
  }

  // 모든 볼륨 정보 가져오기
  getVolumeStatus() {
    return {
      master: this.masterVolume,
      music: this.musicVolume,
      effects: this.effectsVolume,
      effectiveMusic: this.getEffectiveMusicVolume(),
      effectiveEffects: this.getEffectiveEffectsVolume(),
      muted: this.muted
    };
  }

  // 프리셋 적용
  applyPreset(preset) {
    if (preset.master !== undefined) {
      this.setMasterVolume(preset.master);
    }
    if (preset.music !== undefined) {
      this.setMusicVolume(preset.music);
    }
    if (preset.effects !== undefined) {
      this.setEffectsVolume(preset.effects);
    }

    logger.info('볼륨 프리셋 적용');
  }

  destroy() {
    this.masterVolume = 0.5;
    this.musicVolume = 0.5;
    this.effectsVolume = 0.5;
    this.muted = false;
  }
}
