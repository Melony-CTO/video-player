/**
 * 음악 플레이어 모듈
 */

import { DOM } from '../../core/dom.js';
import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class MusicPlayer {
  constructor() {
    this.player = null;
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.playlist = [];
    this.currentIndex = 0;
  }

  init() {
    this.player = DOM.audio.musicPlayer;

    if (!this.player) {
      logger.error('Music player element not found');
      return false;
    }

    // 이벤트 리스너 설정
    this.setupEventListeners();

    logger.info('음악 플레이어 초기화 완료');
    return true;
  }

  setupEventListeners() {
    // 트랙 종료 이벤트
    this.player.addEventListener('ended', () => {
      eventBus.emit('track:ended', this.currentTrack);
      this.next();
    });

    // 재생 중 이벤트
    this.player.addEventListener('playing', () => {
      this.isPlaying = true;
      eventBus.emit('music:playing', this.currentTrack);
    });

    // 일시정지 이벤트
    this.player.addEventListener('pause', () => {
      this.isPlaying = false;
      eventBus.emit('music:paused', this.currentTrack);
    });

    // 에러 이벤트
    this.player.addEventListener('error', (e) => {
      logger.error(`음악 재생 오류: ${e.message}`);
      eventBus.emit('music:error', e);
    });

    // 메타데이터 로드 완료
    this.player.addEventListener('loadedmetadata', () => {
      eventBus.emit('music:loaded', this.currentTrack);
    });
  }

  loadTrack(track) {
    if (!track || !track.url) {
      logger.error('유효하지 않은 트랙입니다');
      return;
    }

    this.currentTrack = track;
    this.player.src = track.url;
    this.player.load();

    logger.info(`트랙 로드: ${track.title || track.url}`);
    eventBus.emit('track:loaded', track);
  }

  play() {
    if (!this.player.src) {
      if (this.playlist.length > 0) {
        this.loadTrack(this.playlist[this.currentIndex]);
      } else {
        logger.warning('재생할 트랙이 없습니다');
        return;
      }
    }

    this.player.play()
      .then(() => {
        this.isPlaying = true;
        logger.info('▶ 재생 시작');
      })
      .catch(err => {
        logger.error(`재생 실패: ${err.message}`);
      });
  }

  pause() {
    this.player.pause();
    this.isPlaying = false;
    logger.info('⏸ 일시정지');
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    if (this.playlist.length === 0) {
      logger.warning('플레이리스트가 비어있습니다');
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadTrack(this.playlist[this.currentIndex]);
    this.play();

    logger.info('⏭ 다음 트랙');
  }

  previous() {
    if (this.playlist.length === 0) return;

    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack(this.playlist[this.currentIndex]);
    this.play();

    logger.info('⏮ 이전 트랙');
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.player.volume = this.volume;
    eventBus.emit('volume:changed', this.volume);
  }

  setPlaylist(playlist) {
    this.playlist = playlist;
    this.currentIndex = 0;
    logger.info(`플레이리스트 설정: ${playlist.length}개 트랙`);
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  getCurrentTime() {
    return this.player.currentTime;
  }

  getDuration() {
    return this.player.duration;
  }

  seek(time) {
    this.player.currentTime = time;
  }

  destroy() {
    this.pause();
    this.player.src = '';
    this.playlist = [];
    this.currentTrack = null;
  }
}
