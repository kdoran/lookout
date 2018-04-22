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

export function getCouchUrl (match) {
  const { params: { dbName, couch } } = match
  return {
    dbName,
    couchUrl: parseUrl(couch)
  }
}
