# tests

## local setup
export TEST_URL=[couchdburl]
export TEST_USERNAME=[couchdburl]
export TEST_PASSWORD=[couchdburl]
export TEST_ADMIN_USERNAME=[couchdburl]
export TEST_ADMIN_PASSWORD=[couchdburl]
npm run test-api

## src & browser
run-tests kind of dynamically includes all test files in `src`. When they were
in the root directory webpack would require the readme as well

## tape note

tape used to run in both node & the browser using a utility like this:
```
const tape = require('tape')
const _test = require('tape-promise').default
const test = _test(tape)
// module.exports = {lol: true}

module.exports = test
```

and this in webpack:
```
// so tape can run in browser
node: {
  fs: 'empty'
}
```

which was really helpful for developing using devtools in the browser.
node with --inspect-brk refreshing is a long process.

But after npm installing something, local environment started getting this error:
```
ERROR in ./node_modules/stream-browserify/index.js
Module not found: Error: Can't resolve 'readable-stream/duplex.js' in '/Users/kevin/code/lookout-quatre/node_modules/stream-browserify'
 @ ./node_modules/stream-browserify/index.js 30:16-52
 @ ./node_modules/through/index.js
 @ ./node_modules/tape/index.js
 @ ./tests/tape-util.js
 @ ./tests/smalltest.js
 @ ./tests/browser/pouch-adapter-test.js
 @ ./tests/browser sync -test\.js$
 @ ./tests/run-tests.js
```

tried these steps found on the internet:
- blow away node modules & clear cache
- npm i stream
- npm i readable-stream

didn't yet try:
- re-installing node yet.
- figuring out which other dependency messes up readable-stream via tape

So using smalltest to pretend to be tape for a while
