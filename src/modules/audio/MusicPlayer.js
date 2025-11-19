/**
 * 음악 플레이어 모듈 - Howler.js 기반
 * 크로스페이드, 프리로딩, 안정적인 재생 지원
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class MusicPlayer {
  constructor() {
    this.currentHowl = null;      // 현재 재생 중인 Howl 객체
    this.nextHowl = null;          // 프리로드된 다음 트랙
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.playlist = [];
    this.currentIndex = 0;
    this.shuffleEngine = null;

    // 크로스페이드 설정
    this.crossfadeDuration = 3000; // 3초
    this.preloadThreshold = 0.8;   // 80% 재생 시점에 프리로드

    // 프리로드 체크용 인터벌
    this.preloadCheckInterval = null;
  }

  init() {
    // Howler.js가 로드되었는지 확인
    if (typeof Howl === 'undefined') {
      logger.error('Howler.js가 로드되지 않았습니다');
      return false;
    }

    logger.info('음악 플레이어 초기화 완료 (Howler.js)');
    return true;
  }

  /**
   * 트랙 로드 (Howl 객체 생성)
   */
  loadTrack(track) {
    if (!track || !track.url) {
      logger.error('유효하지 않은 트랙입니다');
      return;
    }

    // 기존 Howl 정리
    if (this.currentHowl) {
      this.currentHowl.unload();
    }

    // 프리로드 체크 중지
    this.stopPreloadCheck();

    this.currentTrack = track;

    // 새 Howl 생성
    this.currentHowl = new Howl({
      src: [track.url],
      html5: true,          // 스트리밍 최적화
      volume: this.volume,
      preload: true,
      onload: () => {
        logger.debug(`트랙 로드 완료: ${track.title || track.url}`);
        eventBus.emit('track:loaded', track);
      },
      onplay: () => {
        this.isPlaying = true;
        eventBus.emit('music:playing', {
          track: this.currentTrack,
          index: this.currentIndex
        });

        // 프리로드 체크 시작
        this.startPreloadCheck();
      },
      onpause: () => {
        this.isPlaying = false;
        eventBus.emit('music:paused', this.currentTrack);
      },
      onend: () => {
        logger.debug('트랙 종료');
        eventBus.emit('track:ended', this.currentTrack);

        // 크로스페이드로 다음 곡 재생
        this.playNextWithCrossfade();
      },
      onloaderror: (id, error) => {
        logger.error(`트랙 로드 오류: ${error}`);
        eventBus.emit('music:error', { track, error });

        // 로드 실패 시 다음 곡으로
        setTimeout(() => this.next(), 1000);
      },
      onplayerror: (id, error) => {
        logger.error(`재생 오류: ${error}`);

        // 재생 시도 재시도
        setTimeout(() => {
          if (this.currentHowl) {
            this.currentHowl.once('unlock', () => {
              this.currentHowl.play();
            });
          }
        }, 500);
      }
    });

    logger.info(`트랙 로드: ${track.title || track.url}`);
  }

  /**
   * 재생
   */
  play() {
    if (!this.currentHowl) {
      // 플레이리스트에서 첫 트랙 로드
      if (this.playlist.length > 0) {
        this.loadTrack(this.playlist[this.currentIndex]);
      } else {
        logger.warning('재생할 트랙이 없습니다');
        return;
      }
    }

    if (this.currentHowl && !this.isPlaying) {
      this.currentHowl.play();
      logger.info('▶ 재생 시작');
    }
  }

  /**
   * 일시정지
   */
  pause() {
    if (this.currentHowl && this.isPlaying) {
      this.currentHowl.pause();
      logger.info('⏸ 일시정지');
    }
  }

  /**
   * 정지
   */
  stop() {
    if (this.currentHowl) {
      this.currentHowl.stop();
      this.stopPreloadCheck();
      logger.info('⏹ 정지');
    }
  }

  /**
   * 재생/일시정지 토글
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 다음 트랙
   */
  next() {
    if (this.playlist.length === 0) {
      logger.warning('플레이리스트가 비어있습니다');
      return;
    }

    let nextTrack = null;
    let nextIndex = this.currentIndex;

    // ShuffleEngine이 있으면 사용
    if (this.shuffleEngine) {
      nextTrack = this.shuffleEngine.getNext(this.currentIndex);

      if (nextTrack) {
        nextIndex = this.shuffleEngine.findTrackIndex(nextTrack);
      } else {
        // 플레이리스트 끝 (repeat off)
        logger.info('플레이리스트 끝');
        eventBus.emit('playlist:ended');
        this.stop();
        return;
      }
    } else {
      // ShuffleEngine이 없으면 기본 순차 재생
      nextIndex = (this.currentIndex + 1) % this.playlist.length;
      nextTrack = this.playlist[nextIndex];
    }

    this.currentIndex = nextIndex;
    this.loadTrack(nextTrack);
    this.play();

    logger.info('⏭ 다음 트랙');
  }

  /**
   * 이전 트랙
   */
  previous() {
    if (this.playlist.length === 0) return;

    let prevTrack = null;
    let prevIndex = this.currentIndex;

    // ShuffleEngine이 있으면 사용
    if (this.shuffleEngine) {
      prevTrack = this.shuffleEngine.getPrevious(this.currentIndex);

      if (prevTrack) {
        prevIndex = this.shuffleEngine.findTrackIndex(prevTrack);
      } else {
        // 플레이리스트 시작
        return;
      }
    } else {
      // ShuffleEngine이 없으면 기본 순차 재생
      prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      prevTrack = this.playlist[prevIndex];
    }

    this.currentIndex = prevIndex;
    this.loadTrack(prevTrack);
    this.play();

    logger.info('⏮ 이전 트랙');
  }

  /**
   * 크로스페이드로 다음 곡 재생
   */
  playNextWithCrossfade() {
    // 다음 트랙이 프리로드되어 있으면 크로스페이드
    if (this.nextHowl && this.currentHowl) {
      logger.debug('크로스페이드 시작');

      // 현재 트랙 페이드아웃
      this.currentHowl.fade(this.volume, 0, this.crossfadeDuration);

      // 다음 트랙 페이드인
      this.nextHowl.volume(0);
      this.nextHowl.play();
      this.nextHowl.fade(0, this.volume, this.crossfadeDuration);

      // 페이드 완료 후 현재 트랙 정리
      setTimeout(() => {
        if (this.currentHowl) {
          this.currentHowl.unload();
        }
        this.currentHowl = this.nextHowl;
        this.nextHowl = null;
      }, this.crossfadeDuration);

    } else {
      // 프리로드 안 되어 있으면 일반 전환
      this.next();
    }
  }

  /**
   * 다음 트랙 프리로드
   */
  preloadNextTrack() {
    if (this.playlist.length === 0) return;
    if (this.nextHowl) return; // 이미 프리로드됨

    let nextTrack = null;
    let nextIndex = this.currentIndex;

    // 다음 트랙 인덱스 계산
    if (this.shuffleEngine) {
      nextTrack = this.shuffleEngine.getNext(this.currentIndex);
      if (nextTrack) {
        nextIndex = this.shuffleEngine.findTrackIndex(nextTrack);
      }
    } else {
      nextIndex = (this.currentIndex + 1) % this.playlist.length;
      nextTrack = this.playlist[nextIndex];
    }

    if (!nextTrack) return;

    // 다음 트랙 프리로드
    this.nextHowl = new Howl({
      src: [nextTrack.url],
      html5: true,
      volume: this.volume,
      preload: true,
      onload: () => {
        logger.debug(`다음 트랙 프리로드 완료: ${nextTrack.title || nextTrack.url}`);
      }
    });
  }

  /**
   * 프리로드 체크 시작
   */
  startPreloadCheck() {
    this.stopPreloadCheck();

    this.preloadCheckInterval = setInterval(() => {
      if (!this.currentHowl || !this.isPlaying) return;

      const duration = this.currentHowl.duration();
      const currentTime = this.currentHowl.seek();

      // 80% 재생 시점에 프리로드
      if (currentTime / duration >= this.preloadThreshold) {
        this.preloadNextTrack();
        this.stopPreloadCheck(); // 한 번만 프리로드
      }
    }, 1000); // 1초마다 체크
  }

  /**
   * 프리로드 체크 중지
   */
  stopPreloadCheck() {
    if (this.preloadCheckInterval) {
      clearInterval(this.preloadCheckInterval);
      this.preloadCheckInterval = null;
    }
  }

  /**
   * 시크 (특정 위치로 이동)
   */
  seek(seconds) {
    if (this.currentHowl) {
      this.currentHowl.seek(seconds);
      logger.debug(`시크: ${seconds}초`);
    }
  }

  /**
   * 볼륨 설정
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.currentHowl) {
      this.currentHowl.volume(this.volume);
    }

    eventBus.emit('volume:changed', this.volume);
  }

  /**
   * 플레이리스트 설정
   */
  setPlaylist(playlist) {
    this.playlist = playlist;
    this.currentIndex = 0;

    // ShuffleEngine에도 플레이리스트 설정
    if (this.shuffleEngine) {
      this.shuffleEngine.setPlaylist(playlist);
    }

    logger.info(`플레이리스트 설정: ${playlist.length}개 트랙`);
  }

  /**
   * ShuffleEngine 연결
   */
  setShuffleEngine(shuffleEngine) {
    this.shuffleEngine = shuffleEngine;

    // 현재 플레이리스트가 있으면 ShuffleEngine에 설정
    if (this.playlist.length > 0) {
      this.shuffleEngine.setPlaylist(this.playlist);
    }

    logger.debug('ShuffleEngine 연결됨');
  }

  /**
   * 현재 트랙 가져오기
   */
  getCurrentTrack() {
    return this.currentTrack;
  }

  /**
   * 현재 재생 시간 가져오기
   */
  getCurrentTime() {
    if (this.currentHowl) {
      return this.currentHowl.seek() || 0;
    }
    return 0;
  }

  /**
   * 전체 재생 시간 가져오기
   */
  getDuration() {
    if (this.currentHowl) {
      return this.currentHowl.duration() || 0;
    }
    return 0;
  }

  /**
   * 재생 상태 확인
   */
  playing() {
    return this.isPlaying;
  }

  /**
   * 정리
   */
  destroy() {
    this.stop();
    this.stopPreloadCheck();

    if (this.currentHowl) {
      this.currentHowl.unload();
      this.currentHowl = null;
    }

    if (this.nextHowl) {
      this.nextHowl.unload();
      this.nextHowl = null;
    }

    this.playlist = [];
    this.currentTrack = null;

    logger.info('음악 플레이어 정리 완료');
  }
}
