/**
 * DOM 요소 캐싱 시스템
 */

export class DOMCache {
  constructor() {
    this.overlay = {};
    this.intro = {};
    this.loops = {};
    this.audio = {};
    this.ui = {};
    this.controls = {};
  }

  init() {
    // Overlay 요소들
    this.overlay.video = document.getElementById('overlayVideo');
    this.overlay.enabled = document.getElementById('overlayEnabled');
    this.overlay.opacitySlider = document.getElementById('overlay-opacity-slider');
    this.overlay.opacityValue = document.getElementById('overlay-opacity-value');
    this.overlay.blendMode = document.getElementById('overlayBlendMode');
    this.overlay.fileStatus = document.getElementById('overlayFileStatus');
    this.overlay.applyBtn = document.getElementById('applyOverlayBtn');

    // Intro 요소들
    this.intro.video = document.getElementById('introVideo');
    this.intro.enabled = document.getElementById('introEnabled');
    this.intro.opacitySlider = document.getElementById('intro-opacity-slider');
    this.intro.opacityValue = document.getElementById('intro-opacity-value');
    this.intro.blendMode = document.getElementById('introBlendMode');
    this.intro.fileStatus = document.getElementById('introFileStatus');
    this.intro.applyBtn = document.getElementById('applyIntroBtn');

    // 루프 비디오들
    this.loops.loop1 = document.getElementById('loop1');
    this.loops.loop2 = document.getElementById('loop2');

    // 로고들
    this.loops.logo1 = document.getElementById('logo1');
    this.loops.logo2 = document.getElementById('logo2');

    // 오디오 요소들
    this.audio.musicPlayer = document.getElementById('musicPlayer');

    // UI 요소들
    this.ui.controlCenter = document.getElementById('controlCenter');
    this.ui.playlistDisplay = document.getElementById('playlistDisplay');
    this.ui.logDisplay = document.getElementById('logDisplay');
    this.ui.startButton = document.getElementById('startButton');

    // 컨트롤 요소들
    this.controls.playBtn = document.getElementById('playBtn');
    this.controls.nextBtn = document.getElementById('nextBtn');
    this.controls.shuffleBtn = document.getElementById('shuffleBtn');
    this.controls.titleDisplay = document.getElementById('titleDisplay');
    this.controls.controlPanel = document.querySelector('.control-panel');
  }

  get(category, element) {
    return this[category]?.[element];
  }

  getAll(category) {
    return this[category];
  }
}

// 싱글톤 인스턴스 export
export const DOM = new DOMCache();
