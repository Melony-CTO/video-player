/**
 * 앱 초기화 및 라이프사이클 관리
 */

import { DOM } from './dom.js';
import { logger } from './logger.js';
import { eventBus } from './events.js';

export class App {
  constructor() {
    this.initialized = false;
    this.modules = {};
  }

  async init() {
    if (this.initialized) {
      logger.warning('App already initialized');
      return;
    }

    try {
      // DOM 캐시 초기화
      DOM.init();
      logger.debug('DOM cache initialized');

      // 로거 설정
      if (DOM.ui.logDisplay) {
        logger.setLogDisplay(DOM.ui.logDisplay);
      }

      // 초기화 완료
      this.initialized = true;
      logger.info('App initialized successfully');

      // 초기화 완료 이벤트 발생
      eventBus.emit('app:initialized');

    } catch (error) {
      logger.error(`App initialization failed: ${error.message}`);
      throw error;
    }
  }

  registerModule(name, module) {
    this.modules[name] = module;
    logger.debug(`Module registered: ${name}`);
  }

  getModule(name) {
    return this.modules[name];
  }

  async start() {
    if (!this.initialized) {
      await this.init();
    }

    logger.info('App started');
    eventBus.emit('app:started');
  }

  destroy() {
    // 모든 모듈 정리
    Object.values(this.modules).forEach(module => {
      if (module.destroy && typeof module.destroy === 'function') {
        module.destroy();
      }
    });

    // 이벤트 버스 정리
    eventBus.clear();

    this.initialized = false;
    logger.info('App destroyed');
  }
}

// 싱글톤 인스턴스 export
export const app = new App();
