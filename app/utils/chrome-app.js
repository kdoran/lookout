export function isChromeApp () {
  return window.chrome && chrome.app && chrome.app.runtime
}
