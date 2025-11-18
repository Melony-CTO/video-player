/**
 * 플레이리스트 UI 모듈
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class PlaylistUI {
  constructor() {
    this.container = null;
    this.playlist = [];
    this.currentTrackIndex = -1;
  }

  init(containerId = 'playlistDisplay') {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      logger.error('플레이리스트 UI 컨테이너를 찾을 수 없음');
      return false;
    }

    // 이벤트 리스너 설정
    this.setupEventListeners();

    logger.info('플레이리스트 UI 초기화 완료');
    return true;
  }

  setupEventListeners() {
    // 플레이리스트 변경 이벤트
    eventBus.on('playlist:current:changed', (playlist) => {
      this.setPlaylist(playlist.tracks);
    });

    // 트랙 로드 이벤트
    eventBus.on('track:loaded', (track) => {
      this.highlightCurrentTrack(track);
    });

    // 플레이리스트 UI 클릭 이벤트
    if (this.container) {
      this.container.addEventListener('click', (e) => {
        const item = e.target.closest('.playlist-item');
        if (item) {
          const index = parseInt(item.dataset.index);
          this.handleTrackClick(index);
        }
      });
    }
  }

  setPlaylist(playlist) {
    this.playlist = playlist;
    this.render();

    logger.info(`플레이리스트 UI 업데이트: ${playlist.length}개 트랙`);
  }

  render() {
    if (!this.container) return;

    // 컨테이너 초기화
    this.container.innerHTML = '';

    if (this.playlist.length === 0) {
      this.container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">플레이리스트가 비어있습니다</div>';
      return;
    }

    // 각 트랙 아이템 생성
    this.playlist.forEach((track, index) => {
      const item = this.createTrackItem(track, index);
      this.container.appendChild(item);
    });
  }

  createTrackItem(track, index) {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.dataset.index = index;

    // 현재 재생 중인 트랙 표시
    if (index === this.currentTrackIndex) {
      item.classList.add('current');
    }

    // 트랙 정보
    const title = track.title || track.url || '알 수 없는 트랙';
    const artist = track.artist || '';
    const duration = this.formatDuration(track.duration);

    item.innerHTML = `
      <span class="track-number">${index + 1}</span>
      <span class="track-title">${title}</span>
      ${artist ? `<span class="track-artist">${artist}</span>` : ''}
      ${duration ? `<span class="track-duration">${duration}</span>` : ''}
    `;

    return item;
  }

  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  highlightCurrentTrack(track) {
    // 현재 트랙 인덱스 찾기
    const index = this.playlist.findIndex(t =>
      t === track || t.url === track.url
    );

    if (index !== -1) {
      this.setCurrentTrack(index);
    }
  }

  setCurrentTrack(index) {
    this.currentTrackIndex = index;

    // 모든 아이템에서 current 클래스 제거
    const items = this.container.querySelectorAll('.playlist-item');
    items.forEach(item => item.classList.remove('current'));

    // 현재 트랙에 current 클래스 추가
    const currentItem = this.container.querySelector(`[data-index="${index}"]`);
    if (currentItem) {
      currentItem.classList.add('current');

      // 자동 스크롤
      currentItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }

  handleTrackClick(index) {
    if (index >= 0 && index < this.playlist.length) {
      const track = this.playlist[index];

      logger.info(`트랙 선택: ${track.title || track.url}`);
      eventBus.emit('ui:track:selected', { track, index });
    }
  }

  addTrack(track) {
    this.playlist.push(track);
    this.render();
  }

  removeTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.playlist.splice(index, 1);
      this.render();
    }
  }

  clear() {
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.render();

    logger.info('플레이리스트 UI 초기화');
  }

  scrollToTop() {
    if (this.container) {
      this.container.scrollTop = 0;
    }
  }

  scrollToCurrentTrack() {
    const currentItem = this.container.querySelector('.playlist-item.current');
    if (currentItem) {
      currentItem.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  destroy() {
    this.clear();
    this.container = null;
  }
}
