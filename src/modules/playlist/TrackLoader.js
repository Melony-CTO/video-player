/**
 * 트랙 로더 모듈
 * 플레이리스트 파일(.js, .json)이나 오디오 파일을 로드
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class TrackLoader {
  constructor() {
    this.supportedAudioFormats = ['mp3', 'm4a', 'wav', 'ogg', 'flac', 'aac'];
    this.supportedPlaylistFormats = ['js', 'json'];
  }

  init() {
    logger.info('트랙 로더 초기화 완료');
    return true;
  }

  // 파일에서 플레이리스트 로드
  async loadPlaylistFromFile(file) {
    try {
      const extension = this.getFileExtension(file.name);

      if (extension === 'json') {
        return await this.loadJsonPlaylist(file);
      } else if (extension === 'js') {
        return await this.loadJsPlaylist(file);
      } else {
        logger.error(`지원하지 않는 플레이리스트 형식: ${extension}`);
        return null;
      }

    } catch (error) {
      logger.error(`플레이리스트 로드 실패: ${error.message}`);
      return null;
    }
  }

  // JSON 플레이리스트 로드
  async loadJsonPlaylist(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const playlist = JSON.parse(e.target.result);
          logger.info(`JSON 플레이리스트 로드: ${playlist.length || 0}개 트랙`);
          resolve(playlist);
        } catch (error) {
          reject(new Error('JSON 파싱 실패'));
        }
      };

      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file);
    });
  }

  // JavaScript 플레이리스트 로드
  async loadJsPlaylist(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;

          // 플레이리스트 배열 추출
          const playlist = this.extractPlaylistFromJs(content);

          if (playlist) {
            logger.info(`JS 플레이리스트 로드: ${playlist.length}개 트랙`);
            resolve(playlist);
          } else {
            reject(new Error('플레이리스트 데이터를 찾을 수 없습니다'));
          }

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file);
    });
  }

  // JS 파일에서 플레이리스트 배열 추출
  extractPlaylistFromJs(content) {
    try {
      // 배열 패턴 찾기
      const arrayMatch = content.match(/\[[\s\S]*?\]/);
      if (!arrayMatch) return null;

      // eval 대신 Function 생성자 사용 (더 안전)
      const playlistFunc = new Function(`return ${arrayMatch[0]}`);
      const playlist = playlistFunc();

      return Array.isArray(playlist) ? playlist : null;

    } catch (error) {
      logger.error(`JS 플레이리스트 파싱 실패: ${error.message}`);
      return null;
    }
  }

  // 오디오 파일 로드
  async loadAudioFile(file) {
    if (!this.isAudioFile(file)) {
      logger.error(`지원하지 않는 오디오 형식: ${file.type}`);
      return null;
    }

    try {
      const url = URL.createObjectURL(file);
      const track = {
        title: this.getFileName(file.name),
        url: url,
        file: file,
        type: file.type,
        size: file.size,
        duration: 0
      };

      // 메타데이터 로드 (옵션)
      await this.loadMetadata(track);

      logger.info(`오디오 파일 로드: ${track.title}`);
      eventBus.emit('track:file:loaded', track);

      return track;

    } catch (error) {
      logger.error(`오디오 파일 로드 실패: ${error.message}`);
      return null;
    }
  }

  // 여러 오디오 파일 로드
  async loadAudioFiles(files) {
    const tracks = [];

    for (const file of files) {
      if (this.isAudioFile(file)) {
        const track = await this.loadAudioFile(file);
        if (track) {
          tracks.push(track);
        }
      }
    }

    logger.info(`오디오 파일 로드 완료: ${tracks.length}개`);
    return tracks;
  }

  // 메타데이터 로드 (duration 등)
  async loadMetadata(track) {
    return new Promise((resolve) => {
      const audio = new Audio(track.url);

      audio.addEventListener('loadedmetadata', () => {
        track.duration = audio.duration;
        resolve();
      });

      audio.addEventListener('error', () => {
        logger.warning(`메타데이터 로드 실패: ${track.title}`);
        resolve();
      });

      // 타임아웃 설정 (5초)
      setTimeout(() => resolve(), 5000);
    });
  }

  // 파일 확장자 확인
  isAudioFile(file) {
    const extension = this.getFileExtension(file.name);
    return this.supportedAudioFormats.includes(extension.toLowerCase());
  }

  isPlaylistFile(file) {
    const extension = this.getFileExtension(file.name);
    return this.supportedPlaylistFormats.includes(extension.toLowerCase());
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  getFileName(filename) {
    return filename.replace(/\.[^/.]+$/, '');
  }

  // URL에서 트랙 로드
  async loadFromUrl(url, title = null) {
    try {
      const track = {
        title: title || this.getFileName(url),
        url: url,
        type: 'audio',
        remote: true
      };

      logger.info(`URL에서 트랙 로드: ${track.title}`);
      eventBus.emit('track:url:loaded', track);

      return track;

    } catch (error) {
      logger.error(`URL 로드 실패: ${error.message}`);
      return null;
    }
  }

  destroy() {
    // 정리 작업
  }
}
