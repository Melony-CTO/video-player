/**
 * 프리셋 시스템 모듈
 * 전체 설정을 저장/로드/관리
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class PresetSystem {
  constructor() {
    this.presets = new Map();
    this.currentPreset = null;
    this.storageKey = 'videoPlayer:presets';
  }

  init() {
    // localStorage에서 프리셋 로드
    this.loadFromStorage();

    logger.info(`프리셋 시스템 초기화: ${this.presets.size}개 프리셋`);
    return true;
  }

  // 현재 설정을 프리셋으로 저장
  save(name, description = '') {
    if (!name || name.trim() === '') {
      logger.error('프리셋 이름이 필요합니다');
      return false;
    }

    const preset = {
      name: name.trim(),
      description,
      timestamp: new Date().toISOString(),
      settings: this.captureCurrentSettings()
    };

    this.presets.set(name, preset);
    this.saveToStorage();

    logger.info(`프리셋 저장: ${name}`);
    eventBus.emit('preset:saved', preset);

    return true;
  }

  // 현재 설정 캡처
  captureCurrentSettings() {
    const settings = {};

    // 이벤트 발행하여 각 모듈에서 설정 수집
    eventBus.emit('preset:capture', settings);

    return settings;
  }

  // 프리셋 로드
  load(name) {
    const preset = this.presets.get(name);

    if (!preset) {
      logger.error(`프리셋을 찾을 수 없음: ${name}`);
      return false;
    }

    // 설정 적용
    this.applySettings(preset.settings);
    this.currentPreset = preset;

    logger.info(`프리셋 로드: ${name}`);
    eventBus.emit('preset:loaded', preset);

    return true;
  }

  // 설정 적용
  applySettings(settings) {
    // 이벤트 발행하여 각 모듈에 설정 적용
    eventBus.emit('preset:apply', settings);
  }

  // 프리셋 삭제
  delete(name) {
    if (this.presets.has(name)) {
      this.presets.delete(name);
      this.saveToStorage();

      if (this.currentPreset && this.currentPreset.name === name) {
        this.currentPreset = null;
      }

      logger.info(`프리셋 삭제: ${name}`);
      eventBus.emit('preset:deleted', name);

      return true;
    }

    return false;
  }

  // 프리셋 이름 변경
  rename(oldName, newName) {
    const preset = this.presets.get(oldName);

    if (!preset) {
      logger.error(`프리셋을 찾을 수 없음: ${oldName}`);
      return false;
    }

    if (this.presets.has(newName)) {
      logger.error(`이미 존재하는 프리셋 이름: ${newName}`);
      return false;
    }

    preset.name = newName;
    this.presets.delete(oldName);
    this.presets.set(newName, preset);
    this.saveToStorage();

    logger.info(`프리셋 이름 변경: ${oldName} → ${newName}`);
    eventBus.emit('preset:renamed', { oldName, newName });

    return true;
  }

  // 모든 프리셋 가져오기
  getAll() {
    return Array.from(this.presets.values());
  }

  // 프리셋 가져오기
  get(name) {
    return this.presets.get(name);
  }

  // 프리셋 존재 확인
  exists(name) {
    return this.presets.has(name);
  }

  // localStorage에 저장
  saveToStorage() {
    try {
      const presetsArray = Array.from(this.presets.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(presetsArray));
      logger.debug('프리셋을 localStorage에 저장');
    } catch (error) {
      logger.error(`프리셋 저장 실패: ${error.message}`);
    }
  }

  // localStorage에서 로드
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);

      if (data) {
        const presetsArray = JSON.parse(data);
        this.presets = new Map(presetsArray);
        logger.debug(`localStorage에서 ${this.presets.size}개 프리셋 로드`);
      }
    } catch (error) {
      logger.error(`프리셋 로드 실패: ${error.message}`);
      this.presets = new Map();
    }
  }

  // 프리셋 내보내기 (JSON)
  export(name) {
    const preset = this.presets.get(name);

    if (!preset) {
      logger.error(`프리셋을 찾을 수 없음: ${name}`);
      return null;
    }

    return JSON.stringify(preset, null, 2);
  }

  // 모든 프리셋 내보내기
  exportAll() {
    const presetsArray = Array.from(this.presets.values());
    return JSON.stringify(presetsArray, null, 2);
  }

  // 프리셋 가져오기 (JSON)
  import(jsonString) {
    try {
      const preset = JSON.parse(jsonString);

      if (!preset.name || !preset.settings) {
        logger.error('유효하지 않은 프리셋 데이터');
        return false;
      }

      this.presets.set(preset.name, preset);
      this.saveToStorage();

      logger.info(`프리셋 가져오기: ${preset.name}`);
      eventBus.emit('preset:imported', preset);

      return true;

    } catch (error) {
      logger.error(`프리셋 가져오기 실패: ${error.message}`);
      return false;
    }
  }

  // 여러 프리셋 가져오기
  importAll(jsonString) {
    try {
      const presets = JSON.parse(jsonString);

      if (!Array.isArray(presets)) {
        logger.error('유효하지 않은 프리셋 배열');
        return false;
      }

      let count = 0;
      presets.forEach(preset => {
        if (preset.name && preset.settings) {
          this.presets.set(preset.name, preset);
          count++;
        }
      });

      this.saveToStorage();

      logger.info(`${count}개 프리셋 가져오기 완료`);
      eventBus.emit('preset:imported:all', count);

      return true;

    } catch (error) {
      logger.error(`프리셋 가져오기 실패: ${error.message}`);
      return false;
    }
  }

  // 모든 프리셋 삭제
  clearAll() {
    this.presets.clear();
    this.currentPreset = null;
    this.saveToStorage();

    logger.info('모든 프리셋 삭제');
    eventBus.emit('preset:cleared');
  }

  getCurrentPreset() {
    return this.currentPreset;
  }

  destroy() {
    this.saveToStorage();
    this.presets.clear();
    this.currentPreset = null;
  }
}
