/**
 * 오디오 비주얼라이저 모듈
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class Visualizer {
  constructor() {
    this.container = null;
    this.bars = [];
    this.barCount = 40;
    this.isPlaying = false;
    this.animationId = null;
  }

  init(containerId = 'audioVisualizer') {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      logger.error('비주얼라이저 컨테이너를 찾을 수 없음');
      return false;
    }

    // 기존 바들 제거
    this.container.innerHTML = '';

    // 비주얼라이저 바 생성
    for (let i = 0; i < this.barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'visualizer-bar';
      bar.style.height = '2px';
      this.container.appendChild(bar);
      this.bars.push(bar);
    }

    // 이벤트 리스너 설정
    this.setupEventListeners();

    logger.info(`비주얼라이저 초기화: ${this.barCount}개 바`);
    return true;
  }

  setupEventListeners() {
    // 오디오 분석 데이터 수신
    eventBus.on('audio:analyzed', (data) => {
      this.updateBars(data);
    });

    // 음악 재생 상태 변경
    eventBus.on('music:playing', () => {
      this.show();
    });

    eventBus.on('music:paused', () => {
      this.hide();
    });
  }

  updateBars(audioData) {
    if (!this.isPlaying || !audioData.data) return;

    const { data, bufferLength } = audioData;
    const barWidth = Math.floor(bufferLength / this.barCount);

    this.bars.forEach((bar, index) => {
      // 각 바에 해당하는 주파수 데이터 평균 계산
      let sum = 0;
      const start = index * barWidth;
      const end = start + barWidth;

      for (let i = start; i < end && i < bufferLength; i++) {
        sum += data[i];
      }

      const average = sum / barWidth;
      const barHeight = Math.max(2, (average / 255) * 30); // 최소 2px, 최대 30px

      bar.style.height = `${barHeight}px`;
    });
  }

  // 간단한 애니메이션 (분석 데이터 없을 때)
  startSimpleAnimation() {
    if (this.animationId) return;

    const animate = () => {
      if (!this.isPlaying) return;

      this.bars.forEach((bar, index) => {
        const height = Math.random() * 20 + 5;
        bar.style.height = `${height}px`;
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  stopSimpleAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  show() {
    if (this.container) {
      this.container.classList.add('playing');
      this.isPlaying = true;
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('playing');
      this.isPlaying = false;
    }

    // 모든 바를 최소 높이로 리셋
    this.bars.forEach(bar => {
      bar.style.height = '2px';
    });
  }

  setBarCount(count) {
    this.barCount = count;
    this.init(this.container.id);
  }

  setColor(color) {
    this.bars.forEach(bar => {
      bar.style.background = color;
    });
  }

  destroy() {
    this.hide();
    this.stopSimpleAnimation();

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.bars = [];
    this.isPlaying = false;
  }
}
