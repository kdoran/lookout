const pb = require('protobufjs')

// the internet recommended using proto buffers for url params
// in the end they are almost the same size as just `btoa(stuff.toString())`
// and a lot of setup (⇀‸↼‶)
// but hey this works

const SIMPLE_STRING = { nested: { SIMPLE_STRING: { fields: { str: { type: 'string', id: 1 } } } } }

function encode (str) {
  const SimpleString = pb.Root.fromJSON(SIMPLE_STRING).SIMPLE_STRING

  const message = SimpleString.create({ str })
  const buffer = SimpleString.encode(message).finish()
  return pb.util.base64.encode(buffer, 0, buffer.length)
}

function decode (encodedStr) {
  const SimpleString = pb.Root.fromJSON(SIMPLE_STRING).SIMPLE_STRING
  const arr = new Uint8Array(pb.util.base64.length(encodedStr))
  pb.util.base64.decode(encodedStr, arr, 0)
  return SimpleString.decode(arr).toJSON().str
}

module.exports = {encode, decode}
