/**
 * 이퀄라이저 모듈
 * Web Audio API를 사용한 3밴드 EQ (Low, Mid, High)
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class Equalizer {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.filters = {
      low: null,
      mid: null,
      high: null
    };
    this.gains = {
      low: 4,
      mid: 2.5,
      high: -2
    };
    this.enabled = false;
  }

  init(audioElement) {
    try {
      // Audio Context 생성
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Source 노드 생성
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);

      // Low 필터 (저음역대)
      this.filters.low = this.audioContext.createBiquadFilter();
      this.filters.low.type = 'lowshelf';
      this.filters.low.frequency.value = 320;
      this.filters.low.gain.value = this.gains.low;

      // Mid 필터 (중음역대)
      this.filters.mid = this.audioContext.createBiquadFilter();
      this.filters.mid.type = 'peaking';
      this.filters.mid.frequency.value = 1000;
      this.filters.mid.Q.value = 0.5;
      this.filters.mid.gain.value = this.gains.mid;

      // High 필터 (고음역대)
      this.filters.high = this.audioContext.createBiquadFilter();
      this.filters.high.type = 'highshelf';
      this.filters.high.frequency.value = 3200;
      this.filters.high.gain.value = this.gains.high;

      // 필터 체인 연결: source -> low -> mid -> high -> destination
      this.sourceNode.connect(this.filters.low);
      this.filters.low.connect(this.filters.mid);
      this.filters.mid.connect(this.filters.high);
      this.filters.high.connect(this.audioContext.destination);

      this.enabled = true;
      logger.info('이퀄라이저 초기화 완료');
      return true;

    } catch (error) {
      logger.error(`이퀄라이저 초기화 실패: ${error.message}`);
      return false;
    }
  }

  setLow(gain) {
    if (!this.filters.low) return;

    this.gains.low = gain;
    this.filters.low.gain.value = gain;

    logger.debug(`EQ Low: ${gain}dB`);
    eventBus.emit('eq:changed', { band: 'low', value: gain });
  }

  setMid(gain) {
    if (!this.filters.mid) return;

    this.gains.mid = gain;
    this.filters.mid.gain.value = gain;

    logger.debug(`EQ Mid: ${gain}dB`);
    eventBus.emit('eq:changed', { band: 'mid', value: gain });
  }

  setHigh(gain) {
    if (!this.filters.high) return;

    this.gains.high = gain;
    this.filters.high.gain.value = gain;

    logger.debug(`EQ High: ${gain}dB`);
    eventBus.emit('eq:changed', { band: 'high', value: gain });
  }

  getGains() {
    return { ...this.gains };
  }

  reset() {
    this.setLow(0);
    this.setMid(0);
    this.setHigh(0);
    logger.info('이퀄라이저 리셋');
  }

  applyPreset(preset) {
    switch (preset) {
      case 'flat':
        this.setLow(0);
        this.setMid(0);
        this.setHigh(0);
        break;
      case 'bass-boost':
        this.setLow(6);
        this.setMid(0);
        this.setHigh(-2);
        break;
      case 'treble-boost':
        this.setLow(-2);
        this.setMid(0);
        this.setHigh(6);
        break;
      case 'vocal':
        this.setLow(-3);
        this.setMid(5);
        this.setHigh(-1);
        break;
      default:
        logger.warning(`알 수 없는 프리셋: ${preset}`);
    }

    logger.info(`프리셋 적용: ${preset}`);
  }

  suspend() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sourceNode = null;
    this.filters = { low: null, mid: null, high: null };
    this.enabled = false;
  }
}
