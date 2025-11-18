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
