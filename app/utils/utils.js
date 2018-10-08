const KB = 1000
const MB = Math.pow(KB, 2)
const GB = Math.pow(KB, 3)
const TB = Math.pow(KB, 4)

export function parseUrl (url) {
  if (!url) return
  if (!url.includes('http')) {
    url = url.includes('localhost') ? 'http://' + url : 'https://' + url
  }
  if (url[url.length - 1] !== '/') {
    url += '/'
  }
  return url
}

export function showMBSize (num) {
  if (!num) return ''
  if (num < MB) {
    return '< 1 MB'
  } else {
    return precisionRound(num / MB, 1) + ' MB'
  }
}

export function showSize (num) {
  if (!num) return ''
  if (num < KB) {
    return num + ' B'
  } else if (num < MB) {
    return precisionRound(num / KB, 1) + ' KB'
  } else if (num < GB) {
    return precisionRound(num / MB, 1) + ' MB'
  } else if (num < TB) {
    return precisionRound(num / GB, 1) + ' GB'
  } else {
    return precisionRound(num / TB, 1) + ' TB'
  }
}

function precisionRound (number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

export function withCommas (num) {
  if (typeof num !== 'number') return num
  return ('' + (Math.round(num * 100) / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function getParams (searchParams) {
  const result = {}
  if (!searchParams) return result
  const split = searchParams.split('?')
  if (!split.length > 1) return result
  split[1].split('&').forEach(part => {
    const item = part.split('=')
    result[item[0]] = decodeURIComponent(item[1])
    const tryNum = Number(result[item[0]])
    if (!isNaN(tryNum)) {
      result[item[0]] = tryNum
    }
  })
  return result
}

export function copyTextToClipboard (text) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    const msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

export function keyMap (keyCode) {
  const keys = {
    13: 'ENTER',
    27: 'ESCAPE',
    38: 'ARROW_UP',
    40: 'ARROW_DOWN',
    191: 'FORWARD_SLASH'
  }
  return keys[keyCode]
}

// https://gist.github.com/nmsdvid/8807205#gistcomment-2313801
export const debounce = (callback, time = 950) => {
  let interval
  return (...args) => {
    clearTimeout(interval)
    interval = setTimeout(() => {
      interval = null

      // eslint-disable-next-line
      callback(...args)
    }, time)
  }
}
