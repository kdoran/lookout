const isEqual = require('lodash/isEqual')
/*
smalltest('entity: list on empty', async t => {
  const comments = await api.findAll('comment')
  t.equals(comments.length, 0, 'finds no comments')
})
*/

const testsToRun = []
let started

function smalltest (name, func) {
  testsToRun.push({name, func})

  if (!started) {
    started = setTimeout(async () => {
      for (i = 0; i < testsToRun.length; i++) {
        const {name, func} = testsToRun[i]
        await runTest(name, func)
      }
      console.log('done running tests?')
    }, 10)
  }
}

function runTest (name, func) {
  const testTypes = {
    equals: (a, b, message = '') => {
      if (typeof a === 'object' || typeof b === 'object') {
        throw new Error('use deepEquals for objects')
      }
      console.assert(a === b, `${name} equal ${message}`)
    },
    deepEquals: (a, b, message = '') => {
      console.assert(isEqual(a, b), `${name} deepEquals ${message}`)
    },
    ok: (a, message = '') => console.assert(a, `${name} ok ${message}`),
    notOk: (a, message = '') => console.assert(!a, `${name} not ok ${message}`),
    fail: (message = '') => console.assert(false, `${name} fail ${message}`),
  }

  const result = func(testTypes)

  if (!result.then) {
    console.log(name)
    return
  }

  return result.then((fin) => {
    console.log(name)
    return fin
  })
}

module.exports = smalltest