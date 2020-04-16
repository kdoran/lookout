/* global URL, Blob */
function downloadJSON (json, fileName) {
  const a = document.createElement('a')
  fileName = `${fileName}-${new Date().toJSON().replace(/\.|:/g, '-')}`
  a.download = fileName.replace(/[\/:*?"<>|]/g, '') + '.json' // eslint-disable-line no-useless-escape
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'text/plain' })
  a.href = URL.createObjectURL(blob)
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

module.exports = {downloadJSON}
