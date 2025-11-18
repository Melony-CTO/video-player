/**
 * 플레이리스트 관리 모듈
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class PlaylistManager {
  constructor() {
    this.playlists = new Map();
    this.currentPlaylist = null;
    this.broadcastPlaylist = [];
    this.selectedPlaylists = [];
  }

  init() {
    // 기본 플레이리스트 생성
    this.createPlaylist('default', '기본 플레이리스트');

    logger.info('플레이리스트 관리자 초기화 완료');
    return true;
  }

  createPlaylist(id, name, tracks = []) {
    const playlist = {
      id,
      name,
      tracks: [...tracks],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.playlists.set(id, playlist);
    logger.info(`플레이리스트 생성: ${name} (${tracks.length}개 트랙)`);

    eventBus.emit('playlist:created', playlist);
    return playlist;
  }

  getPlaylist(id) {
    return this.playlists.get(id);
  }

  getAllPlaylists() {
    return Array.from(this.playlists.values());
  }

  addTrack(playlistId, track) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      logger.error(`플레이리스트를 찾을 수 없음: ${playlistId}`);
      return false;
    }

    playlist.tracks.push(track);
    playlist.updatedAt = new Date();

    logger.info(`트랙 추가: ${track.title || track.url} → ${playlist.name}`);
    eventBus.emit('playlist:track:added', { playlistId, track });

    return true;
  }

  removeTrack(playlistId, trackIndex) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist || trackIndex < 0 || trackIndex >= playlist.tracks.length) {
      logger.error('트랙 제거 실패');
      return false;
    }

    const removedTrack = playlist.tracks.splice(trackIndex, 1)[0];
    playlist.updatedAt = new Date();

    logger.info(`트랙 제거: ${removedTrack.title || removedTrack.url}`);
    eventBus.emit('playlist:track:removed', { playlistId, track: removedTrack, index: trackIndex });

    return true;
  }

  clearPlaylist(playlistId) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) return false;

    playlist.tracks = [];
    playlist.updatedAt = new Date();

    logger.info(`플레이리스트 초기화: ${playlist.name}`);
    eventBus.emit('playlist:cleared', playlistId);

    return true;
  }

  deletePlaylist(playlistId) {
    if (this.playlists.has(playlistId)) {
      const playlist = this.playlists.get(playlistId);
      this.playlists.delete(playlistId);

      logger.info(`플레이리스트 삭제: ${playlist.name}`);
      eventBus.emit('playlist:deleted', playlistId);

      return true;
    }

    return false;
  }

  setCurrentPlaylist(playlistId) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      logger.error(`플레이리스트를 찾을 수 없음: ${playlistId}`);
      return false;
    }

    this.currentPlaylist = playlist;
    logger.info(`현재 플레이리스트 설정: ${playlist.name}`);

    eventBus.emit('playlist:current:changed', playlist);
    return true;
  }

  getCurrentPlaylist() {
    return this.currentPlaylist;
  }

  // 방송용 통합 플레이리스트 생성
  createBroadcastPlaylist(playlistIds) {
    this.broadcastPlaylist = [];
    this.selectedPlaylists = playlistIds;

    playlistIds.forEach(id => {
      const playlist = this.playlists.get(id);
      if (playlist) {
        this.broadcastPlaylist.push(...playlist.tracks);
      }
    });

    logger.info(`방송 플레이리스트 생성: ${this.broadcastPlaylist.length}개 트랙`);
    eventBus.emit('playlist:broadcast:created', this.broadcastPlaylist);

    return this.broadcastPlaylist;
  }

  getBroadcastPlaylist() {
    return this.broadcastPlaylist;
  }

  getSelectedPlaylists() {
    return this.selectedPlaylists;
  }

  // 플레이리스트 검색
  searchTracks(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    this.playlists.forEach(playlist => {
      playlist.tracks.forEach((track, index) => {
        if (
          track.title?.toLowerCase().includes(lowerQuery) ||
          track.artist?.toLowerCase().includes(lowerQuery) ||
          track.album?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            ...track,
            playlistId: playlist.id,
            playlistName: playlist.name,
            trackIndex: index
          });
        }
      });
    });

    logger.info(`검색 결과: "${query}" - ${results.length}개 트랙`);
    return results;
  }

  // 플레이리스트 내보내기 (JSON)
  exportPlaylist(playlistId) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) return null;

    return JSON.stringify(playlist, null, 2);
  }

  // 플레이리스트 가져오기 (JSON)
  importPlaylist(jsonString) {
    try {
      const playlist = JSON.parse(jsonString);

      if (!playlist.id || !playlist.name) {
        logger.error('유효하지 않은 플레이리스트 데이터');
        return false;
      }

      this.playlists.set(playlist.id, playlist);
      logger.info(`플레이리스트 가져오기: ${playlist.name}`);

      eventBus.emit('playlist:imported', playlist);
      return true;

    } catch (error) {
      logger.error(`플레이리스트 가져오기 실패: ${error.message}`);
      return false;
    }
  }

  destroy() {
    this.playlists.clear();
    this.currentPlaylist = null;
    this.broadcastPlaylist = [];
    this.selectedPlaylists = [];
  }
}
