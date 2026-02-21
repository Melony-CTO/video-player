/**
 * 셔플 엔진 모듈
 * 플레이리스트 셔플 및 순서 관리
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';
import { shuffleArray } from '../../utils/domUtils.js';

export class ShuffleEngine {
  constructor() {
    this.shuffleEnabled = false;
    this.shuffleHistory = [];
    this.originalOrder = [];
    this.currentOrder = [];
    this.repeatMode = 'off'; // 'off', 'all', 'one'
  }

  init() {
    logger.info('셔플 엔진 초기화 완료');
    return true;
  }

  // 셔플 활성화/비활성화
  toggle() {
    this.shuffleEnabled = !this.shuffleEnabled;

    if (this.shuffleEnabled) {
      this.enable();
    } else {
      this.disable();
    }

    logger.info(`셔플 모드: ${this.shuffleEnabled ? 'ON' : 'OFF'}`);
    eventBus.emit('shuffle:toggled', this.shuffleEnabled);

    return this.shuffleEnabled;
  }

  enable() {
    if (this.currentOrder.length > 0) {
      this.shuffle(this.currentOrder);
    }
    this.shuffleEnabled = true;
    eventBus.emit('shuffle:enabled');
  }

  disable() {
    // 원래 순서로 복원
    if (this.originalOrder.length > 0) {
      this.currentOrder = [...this.originalOrder];
    }
    this.shuffleEnabled = false;
    this.shuffleHistory = [];
    eventBus.emit('shuffle:disabled');
  }

  // 플레이리스트 설정
  setPlaylist(playlist) {
    this.originalOrder = [...playlist];
    this.currentOrder = [...playlist];

    if (this.shuffleEnabled) {
      this.shuffle(this.currentOrder);
    }

    logger.info(`플레이리스트 설정: ${playlist.length}개 트랙`);
  }

  // Fisher-Yates 셔플 알고리즘 (domUtils.shuffleArray 활용)
  shuffle(array) {
    this.currentOrder = shuffleArray([...array]);
    this.shuffleHistory = [];

    logger.info('플레이리스트 셔플 완료');
    eventBus.emit('shuffle:shuffled', this.currentOrder);

    return this.currentOrder;
  }

  // 다음 트랙 가져오기
  getNext(currentIndex) {
    if (this.currentOrder.length === 0) return null;

    // Repeat One 모드
    if (this.repeatMode === 'one') {
      return this.currentOrder[currentIndex];
    }

    // 다음 인덱스 계산
    let nextIndex = currentIndex + 1;

    // Repeat All 모드 또는 끝에 도달
    if (nextIndex >= this.currentOrder.length) {
      if (this.repeatMode === 'all') {
        nextIndex = 0;

        // 셔플 모드면 다시 섞기
        if (this.shuffleEnabled) {
          this.shuffle(this.currentOrder);
        }
      } else {
        return null; // 플레이리스트 끝
      }
    }

    this.shuffleHistory.push(currentIndex);
    return this.currentOrder[nextIndex];
  }

  // 이전 트랙 가져오기
  getPrevious(currentIndex) {
    if (this.currentOrder.length === 0) return null;

    // 히스토리가 있으면 히스토리에서 가져오기
    if (this.shuffleHistory.length > 0) {
      const prevIndex = this.shuffleHistory.pop();
      return this.currentOrder[prevIndex];
    }

    // 이전 인덱스 계산
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      if (this.repeatMode === 'all') {
        prevIndex = this.currentOrder.length - 1;
      } else {
        return null;
      }
    }

    return this.currentOrder[prevIndex];
  }

  // 현재 순서 가져오기
  getCurrentOrder() {
    return [...this.currentOrder];
  }

  // 원래 순서 가져오기
  getOriginalOrder() {
    return [...this.originalOrder];
  }

  // Repeat 모드 설정
  setRepeatMode(mode) {
    if (['off', 'all', 'one'].includes(mode)) {
      this.repeatMode = mode;
      logger.info(`반복 모드: ${mode}`);
      eventBus.emit('shuffle:repeat:changed', mode);
    } else {
      logger.warning(`유효하지 않은 반복 모드: ${mode}`);
    }
  }

  // Repeat 모드 순환
  cycleRepeatMode() {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(this.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;

    this.setRepeatMode(modes[nextIndex]);
    return this.repeatMode;
  }

  getRepeatMode() {
    return this.repeatMode;
  }

  isShuffleEnabled() {
    return this.shuffleEnabled;
  }

  // 특정 트랙 찾기
  findTrackIndex(track) {
    return this.currentOrder.findIndex(t => t === track || t.url === track.url);
  }

  // 랜덤 트랙 가져오기
  getRandomTrack() {
    if (this.currentOrder.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * this.currentOrder.length);
    return this.currentOrder[randomIndex];
  }

  // 상태 초기화
  reset() {
    this.currentOrder = [...this.originalOrder];
    this.shuffleHistory = [];
    this.shuffleEnabled = false;
    this.repeatMode = 'off';

    logger.info('셔플 엔진 리셋');
    eventBus.emit('shuffle:reset');
  }

  destroy() {
    this.reset();
    this.originalOrder = [];
    this.currentOrder = [];
  }
}
