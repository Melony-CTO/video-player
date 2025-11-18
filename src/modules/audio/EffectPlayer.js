/**
 * 효과음 플레이어 모듈
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class EffectPlayer {
  constructor() {
    this.effects = {};
    this.effectNames = ['rain', 'bird', 'forest', 'crickets', 'stream', 'wind', 'crackle', 'sand'];
    this.activeEffects = new Set();
    this.volumes = {};
  }

  init() {
    // 각 효과음 요소 초기화
    this.effectNames.forEach(name => {
      const element = document.getElementById(`effect-${name}`);
      if (element) {
        this.effects[name] = element;
        this.volumes[name] = 0.5; // 기본 볼륨 50%
        element.volume = this.volumes[name];
        element.loop = true;
      } else {
        logger.warning(`효과음 요소를 찾을 수 없음: ${name}`);
      }
    });

    logger.info(`효과음 플레이어 초기화: ${Object.keys(this.effects).length}개 효과음`);
    return true;
  }

  toggle(effectName) {
    if (!this.effects[effectName]) {
      logger.error(`존재하지 않는 효과음: ${effectName}`);
      return;
    }

    if (this.activeEffects.has(effectName)) {
      this.stop(effectName);
    } else {
      this.play(effectName);
    }
  }

  play(effectName) {
    const effect = this.effects[effectName];
    if (!effect) {
      logger.error(`효과음을 찾을 수 없음: ${effectName}`);
      return;
    }

    effect.play()
      .then(() => {
        this.activeEffects.add(effectName);
        logger.info(`✅ 효과음 재생: ${effectName}`);
        eventBus.emit('effect:playing', effectName);
      })
      .catch(err => {
        logger.error(`효과음 재생 실패 (${effectName}): ${err.message}`);
      });
  }

  stop(effectName) {
    const effect = this.effects[effectName];
    if (!effect) return;

    effect.pause();
    effect.currentTime = 0;
    this.activeEffects.delete(effectName);

    logger.info(`⏹ 효과음 정지: ${effectName}`);
    eventBus.emit('effect:stopped', effectName);
  }

  stopAll() {
    this.activeEffects.forEach(effectName => {
      this.stop(effectName);
    });
    logger.info('모든 효과음 정지');
  }

  setVolume(effectName, volume) {
    const effect = this.effects[effectName];
    if (!effect) return;

    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.volumes[effectName] = normalizedVolume;
    effect.volume = normalizedVolume;

    eventBus.emit('effect:volume:changed', { name: effectName, volume: normalizedVolume });
  }

  setMasterVolume(volume) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));

    Object.keys(this.effects).forEach(effectName => {
      const baseVolume = this.volumes[effectName] || 0.5;
      this.effects[effectName].volume = baseVolume * normalizedVolume;
    });

    logger.info(`효과음 마스터 볼륨: ${Math.round(normalizedVolume * 100)}%`);
  }

  isActive(effectName) {
    return this.activeEffects.has(effectName);
  }

  getActiveEffects() {
    return Array.from(this.activeEffects);
  }

  getVolume(effectName) {
    return this.volumes[effectName] || 0;
  }

  getAllVolumes() {
    return { ...this.volumes };
  }

  destroy() {
    this.stopAll();
    this.effects = {};
    this.activeEffects.clear();
    this.volumes = {};
  }
}
