/**
 * 로깅 시스템
 */

import { DEBUG, CONFIG } from '../config/constants.js';

export class Logger {
  constructor() {
    this.logDisplay = null;
    this.isControlCenterMode = false;
  }

  setLogDisplay(element) {
    this.logDisplay = element;
  }

  setControlCenterMode(mode) {
    this.isControlCenterMode = mode;
  }

  debug(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  addLog(type, message) {
    if (!this.isControlCenterMode || !this.logDisplay) return;

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;

    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    logEntry.textContent = `[${timestamp}] ${message}`;

    this.logDisplay.appendChild(logEntry);
    this.logDisplay.scrollTop = this.logDisplay.scrollHeight;

    // 로그가 너무 많아지면 오래된 것 제거 (최대 100개)
    while (this.logDisplay.children.length > 100) {
      this.logDisplay.removeChild(this.logDisplay.firstChild);
    }
  }

  info(message) {
    this.addLog('info', message);
  }

  error(message) {
    this.addLog('error', message);
    console.error(message);
  }

  warning(message) {
    this.addLog('warning', message);
    console.warn(message);
  }

  clear() {
    if (this.logDisplay) {
      this.logDisplay.innerHTML = '';
    }
  }
}

// 싱글톤 인스턴스 export
export const logger = new Logger();
