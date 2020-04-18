const keyBy = require('lodash/keyBy')
const get = require('lodash/get')
const {PouchDB} = require('./pouchdb')
const {Adapter} = require('./adapter')

class PouchAdapter extends Adapter {
  constructor ({
    name, schema, pouchOptions = {}, relations = {}
  }) {
    super({name, schema, relations})
    this.pouchDB = new PouchDB(this.name, pouchOptions)
  }

  toRecord (doc) {
    const record = {...doc}
    record.id = doc.id || doc._id
    delete record._id
    delete record._rev
    return record
  }

  toDoc (record, _rev) {
    const doc = {
      ...record,
      _id: record.id,
      _rev
     }
    delete doc.id
    return doc
  }

  createId () {
    return new Date().toJSON() + '_' + this.type + '_' + Math.random()
  }

  createTemplate (inputObject = {}) {
    const id = inputObject.id || this.createId()
    return {
      id,
      ...inputObject,
      type: this.type
    }
  }

  async list () {
    const {docs} = await this.pouchDB.find({
      selector: {type: {'$eq': this.type}},
      limit: Number.MAX_SAFE_INTEGER
    })

    return docs.map(this.toRecord)
  }

  async get (id) {
    const doc = await this.pouchDB.get(id)
    return this.toRecord(doc)
  }

  async create (inputRow) {
    const row = this.createTemplate(inputRow)
    this.throwIfInvalid(row)

    const response = await this.pouchDB.put(this.toDoc(row))
    return row
  }

  async update (id, updatedRow) {
    if (typeof id === 'object') {
      updatedRow = id
      id = updatedRow.id
    } else if (updatedRow.id && updatedRow.id !== id) {
      throw new Error(`update() received id that does not match id on update`)
    } else {
      updatedRow.id = id
    }
    this.throwIfInvalid(updatedRow)

    const {_rev} = await this.pouchDB.get(id)
    const doc = this.toDoc(updatedRow, _rev)
    await this.pouchDB.put(doc)
    return updatedRow
  }

  async createMany (inputRows) {
    const rows = inputRows.map(row => this.createTemplate(row))
    rows.forEach(row => this.throwIfInvalid(row))
    const docs = rows.map(row => this.toDoc(row))
    const response = await this.pouchDB.bulkDocs(docs)
    return rows.map((row, index) => {
      if (response[index].error || !response[index].ok) {
        return response[index]
      }
      return rows[index]
    })
  }

  async updateMany (rows) {
    const revsResponse = await this.pouchDB.find({
      selector: {_id: {'$in': rows.map(row => row.id)}},
      limit: Number.MAX_SAFE_INTEGER,
      fields: ['_id', '_rev']
    })
    const revsById = keyBy(revsResponse.docs, '_id')
    const docs = rows
      .map(row => this.toDoc(row))
      .map(doc => ({
        ...doc,
        _rev: get(revsById[doc._id], '_rev')
      }))

    // return the original row sent if there was no error
    const response = await this.pouchDB.bulkDocs(docs)
    return rows.map((row, index) => {
      if (response[index].error || !response[index].ok) {
        return response[index]
      }
      return rows[index]
    })
  }

  async remove (id) {
    if (typeof id !== 'string') throw new Error('remove expects id')
    const doc = await this.pouchDB.get(id)
    // doing this with pouch.remove(id) threw a 404
    return this.pouchDB.put({...doc, _deleted: true})
  }

  async find (selector, limit = Number.MAX_SAFE_INTEGER) {
    const {docs} = await this.pouchDB.find({
      selector,
      limit
    })

    return docs.map(this.toRecord)
  }

  // returns undefined if doesn't exist
  async findOne (selector) {
    const [oneRecord] = await this.find(selector)
    return oneRecord
  }

  destroyDatabase () {
    return this.pouchDB.destroy()
  }
}

class IndexedDBPouchAdapter extends PouchAdapter {
  constructor (options) {
    const pouchDBOptions = {pouchDBOptions: {adapter: 'idb'}}
    super(Object.assign({}, options, pouchDBOptions))
  }
}

module.exports = {PouchAdapter, IndexedDBPouchAdapter}
