/**
 * 오디오 분석 모듈
 * 비주얼라이저를 위한 주파수 데이터 분석
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.isAnalyzing = false;
    this.animationId = null;
  }

  init(audioElement) {
    try {
      // Audio Context 생성
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Source 노드 생성
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);

      // Analyser 노드 생성
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; // 주파수 해상도 (2^8 = 256)
      this.analyser.smoothingTimeConstant = 0.8; // 부드러운 전환

      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // 노드 연결: source -> analyser -> destination
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      logger.info('오디오 분석기 초기화 완료');
      return true;

    } catch (error) {
      logger.error(`오디오 분석기 초기화 실패: ${error.message}`);
      return false;
    }
  }

  start() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.analyze();

    logger.info('오디오 분석 시작');
  }

  stop() {
    this.isAnalyzing = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    logger.info('오디오 분석 정지');
  }

  analyze() {
    if (!this.isAnalyzing) return;

    this.animationId = requestAnimationFrame(() => this.analyze());

    // 주파수 데이터 가져오기
    this.analyser.getByteFrequencyData(this.dataArray);

    // 데이터를 이벤트로 전송
    eventBus.emit('audio:analyzed', {
      data: this.dataArray,
      bufferLength: this.bufferLength
    });
  }

  getFrequencyData() {
    if (!this.analyser) return null;

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getTimeDomainData() {
    if (!this.analyser) return null;

    const timeDomainData = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(timeDomainData);
    return timeDomainData;
  }

  getAverageFrequency() {
    if (!this.dataArray) return 0;

    const data = this.getFrequencyData();
    if (!data) return 0;

    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }

  getVolumeLevel() {
    const average = this.getAverageFrequency();
    return Math.min(100, (average / 255) * 100);
  }

  // 특정 주파수 대역의 에너지 가져오기
  getBandEnergy(lowFreq, highFreq) {
    if (!this.analyser || !this.dataArray) return 0;

    const sampleRate = this.audioContext.sampleRate;
    const fftSize = this.analyser.fftSize;
    const frequencyStep = sampleRate / fftSize;

    const lowBin = Math.floor(lowFreq / frequencyStep);
    const highBin = Math.floor(highFreq / frequencyStep);

    let sum = 0;
    for (let i = lowBin; i <= highBin && i < this.bufferLength; i++) {
      sum += this.dataArray[i];
    }

    const average = sum / (highBin - lowBin + 1);
    return (average / 255) * 100;
  }

  // 저음역대 에너지
  getBassEnergy() {
    return this.getBandEnergy(20, 250);
  }

  // 중음역대 에너지
  getMidEnergy() {
    return this.getBandEnergy(250, 2000);
  }

  // 고음역대 에너지
  getTrebleEnergy() {
    return this.getBandEnergy(2000, 8000);
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
    this.stop();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.sourceNode = null;
    this.dataArray = null;
  }
}
