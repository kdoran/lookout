const download = require('./download')
const localstorager = require('./localstorager')
const queries = require('./queries')
const urlParams = require('./url-params')
const utils = require('./utils')

module.exports = {
  ...download,
  ...localstorager,
  ...queries,
  ...urlParams,
  ...utils
}
