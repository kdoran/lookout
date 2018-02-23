import PouchDB from 'pouchdb'

const opts = {
  skip_setup: true
}


const remoteUrl = 'http://localhost:5984/sync-test'

const localDb = new PouchDB('local')
const remoteDb = new PouchDB(remoteUrl)
// const total = 10

// const resetDB = (url = remoteUrl) => {
//   return new PouchDB(url).destroy().then(() => {
//     return new PouchDB(url)
//   })
// }

export function parseSnapshot(id) {
  const split = id.split(':')
  return {
    id,
    origin: split[1],
    destination: split[3],
    date: split[5],
    shipmentNo: split[7]
  }
}

const addDocsToDb = (db, numDocs = 1) => {
  const docs = Array.from(new Array(numDocs), (_, i) => ({ _id: `${i}::${new Date().toISOString()}` } ))
  return db.bulkDocs(docs)
}

export const addDocsToRemote = (numDocs) => {
  return addDocsToDb(remoteDb, numDocs)
}

export const addDocsToLocal = (numDocs) => {
  return addDocsToDb(localDb, numDocs)
}

export const sync = () => {
  const ops = {
    batch_size: 10,
    live: true,
    retry: true,
    back_off_function: delay => {
      return 1000
    }
  }
  return PouchDB.sync(localDb, remoteDb, ops)
}

export const getLocalInfo = () => {
  return localDb.info()
}

export const getRemoteInfo = () => {
  return remoteDb.info()
}

export const subscribeToChanges = () => {
  return localDb.changes({
    since: 'now',
    live: true
  })
}


// hacky deep clone
export const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// sync()

// resetDB('local').then(db => {
//   addDocsToDb(db).then(resp => {
//     console.log(resp)
//   })
// })

// initRemote().then(remoteDb => {
//   PouchDB.replicate(remoteDb, localDb, { batch_size: 1 })
//     .on('change', info => console.log(info.pending))
// })

// localDb.info().then(info => console.log(info))

// resetDB().then(remote => {
//   PouchDB.replicate(localDb, remote, { batch_size: 1 })
//     .on('change', info => console.log(info.last_seq))
// })
