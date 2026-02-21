/**
 * DOM 조작 유틸리티
 */

export function createElement(tag, className, innerHTML) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

export function show(element) {
  if (element) {
    element.classList.add('show');
  }
}

export function hide(element) {
  if (element) {
    element.classList.remove('show');
  }
}

export function toggle(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Fisher-Yates 알고리즘으로 배열을 제자리(in-place) 셔플한다.
 * @template T
 * @param {T[]} arr - 셔플할 배열 (원본이 수정됨)
 * @returns {T[]} 셔플된 배열 (동일 참조)
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 값을 0.0 ~ 1.0 범위로 고정한다.
 * @param {number} value
 * @returns {number}
 */
export function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
