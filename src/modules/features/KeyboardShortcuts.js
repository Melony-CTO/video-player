/**
 * 키보드 단축키 모듈
 */

import { logger } from '../../core/logger.js';
import { eventBus } from '../../core/events.js';

export class KeyboardShortcuts {
  constructor() {
    this.enabled = true;
    this.shortcuts = new Map();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init() {
    // 기본 단축키 등록
    this.registerDefaultShortcuts();

    // 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', this.handleKeyDown);

    logger.info('키보드 단축키 초기화 완료');
    return true;
  }

  registerDefaultShortcuts() {
    // 재생 제어
    this.register('Space', 'togglePlay', '재생/일시정지');
    this.register('ArrowRight', 'nextTrack', '다음 트랙');
    this.register('ArrowLeft', 'previousTrack', '이전 트랙');

    // 볼륨 조절
    this.register('ArrowUp', 'volumeUp', '볼륨 올리기');
    this.register('ArrowDown', 'volumeDown', '볼륨 내리기');
    this.register('KeyM', 'toggleMute', '음소거 토글');

    // 셔플 & 반복
    this.register('KeyS', 'toggleShuffle', '셔플 토글');
    this.register('KeyR', 'cycleRepeat', '반복 모드 순환');

    // UI 제어
    this.register('KeyC', 'toggleControlCenter', '컨트롤 센터 토글');
    this.register('KeyT', 'toggleStealthMode', '스텔스 모드 토글');

    // 프리셋
    this.register('Digit1', 'loadPreset1', '프리셋 1 로드', { ctrl: true });
    this.register('Digit2', 'loadPreset2', '프리셋 2 로드', { ctrl: true });
    this.register('Digit3', 'loadPreset3', '프리셋 3 로드', { ctrl: true });

    logger.debug(`${this.shortcuts.size}개 단축키 등록 완료`);
  }

  register(key, action, description = '', modifiers = {}) {
    const shortcut = {
      key,
      action,
      description,
      ctrl: modifiers.ctrl || false,
      alt: modifiers.alt || false,
      shift: modifiers.shift || false
    };

    this.shortcuts.set(this.getShortcutId(key, modifiers), shortcut);
  }

  unregister(key, modifiers = {}) {
    const id = this.getShortcutId(key, modifiers);
    this.shortcuts.delete(id);
  }

  getShortcutId(key, modifiers = {}) {
    let id = '';
    if (modifiers.ctrl) id += 'Ctrl+';
    if (modifiers.alt) id += 'Alt+';
    if (modifiers.shift) id += 'Shift+';
    id += key;
    return id;
  }

  handleKeyDown(e) {
    if (!this.enabled) return;

    // 입력 필드에서는 단축키 무시
    if (this.isInputElement(e.target)) return;

    const modifiers = {
      ctrl: e.ctrlKey || e.metaKey,
      alt: e.altKey,
      shift: e.shiftKey
    };

    const id = this.getShortcutId(e.code, modifiers);
    const shortcut = this.shortcuts.get(id);

    if (shortcut) {
      e.preventDefault();
      this.executeAction(shortcut.action);

      logger.debug(`단축키 실행: ${id} → ${shortcut.action}`);
    }
  }

  isInputElement(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || element.isContentEditable;
  }

  executeAction(action) {
    // 액션을 이벤트로 발행
    eventBus.emit('shortcut:executed', action);

    // 특정 액션 처리
    switch (action) {
      case 'togglePlay':
        eventBus.emit('music:toggle');
        break;
      case 'nextTrack':
        eventBus.emit('music:next');
        break;
      case 'previousTrack':
        eventBus.emit('music:previous');
        break;
      case 'volumeUp':
        eventBus.emit('volume:increase');
        break;
      case 'volumeDown':
        eventBus.emit('volume:decrease');
        break;
      case 'toggleMute':
        eventBus.emit('volume:toggleMute');
        break;
      case 'toggleShuffle':
        eventBus.emit('shuffle:toggle');
        break;
      case 'cycleRepeat':
        eventBus.emit('repeat:cycle');
        break;
      case 'toggleControlCenter':
        eventBus.emit('ui:controlCenter:toggle');
        break;
      case 'toggleStealthMode':
        eventBus.emit('stealth:toggle');
        break;
      case 'loadPreset1':
      case 'loadPreset2':
      case 'loadPreset3':
        const presetNumber = action.slice(-1);
        eventBus.emit('preset:load', `preset${presetNumber}`);
        break;
      default:
        logger.warning(`알 수 없는 액션: ${action}`);
    }
  }

  enable() {
    this.enabled = true;
    logger.info('키보드 단축키 활성화');
  }

  disable() {
    this.enabled = false;
    logger.info('키보드 단축키 비활성화');
  }

  toggle() {
    this.enabled = !this.enabled;
    logger.info(`키보드 단축키: ${this.enabled ? 'ON' : 'OFF'}`);
    return this.enabled;
  }

  getAll() {
    return Array.from(this.shortcuts.values());
  }

  getShortcutsByAction(action) {
    return Array.from(this.shortcuts.values()).filter(s => s.action === action);
  }

  // 단축키 설명 표시용
  getShortcutList() {
    const list = [];

    this.shortcuts.forEach(shortcut => {
      let keys = [];
      if (shortcut.ctrl) keys.push('Ctrl');
      if (shortcut.alt) keys.push('Alt');
      if (shortcut.shift) keys.push('Shift');
      keys.push(this.formatKey(shortcut.key));

      list.push({
        keys: keys.join('+'),
        description: shortcut.description,
        action: shortcut.action
      });
    });

    return list;
  }

  formatKey(key) {
    // 키 이름을 사용자 친화적으로 변환
    const keyMap = {
      'Space': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'KeyM': 'M',
      'KeyS': 'S',
      'KeyR': 'R',
      'KeyC': 'C',
      'KeyT': 'T',
      'Digit1': '1',
      'Digit2': '2',
      'Digit3': '3'
    };

    return keyMap[key] || key;
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
    this.enabled = false;
  }
}
