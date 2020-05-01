const keyBy = require('lodash/keyBy')
const cloneDeep = require('lodash/cloneDeep')
const get = require('lodash/get')
const {PouchDB} = require('./pouchdb')
const {SchemaInterface} = require('./schema-interface')
const {addSchemaDefaults} = require('./pouch-schema-defaults')

class PouchAdapter extends SchemaInterface {
  constructor ({
    schema, pouchDB, pouchDBName, pouchOptions = {}, relations = {}
  }) {
    if (typeof schema !== 'object' || !schema.properties || !schema.name) {
      throw new Error('SchemaInterface usage: schema object with {properties: {}, name} is required')
    }

    if (!pouchDB && !pouchDBName) {
      throw new Error('PouchAdapter usage: pouchDB instance or pouchDB name are required')
    }

    const withDefaults = addSchemaDefaults(schema)
    super(withDefaults)

    this.type = schema.name
    this.pouchDB = pouchDB || new PouchDB(pouchDBName, pouchOptions)
  }

  toEntity (doc) {
    const entity = cloneDeep(doc)
    if (doc._id) {
      entity.id = doc._id
      delete entity._id
    }
    delete entity._rev
    return entity
  }

  beforeCreate (entity) {
    const doc = Object.assign(
      this.getSchemaDefaults(),
      cloneDeep(entity)
    )
    if (doc.hasOwnProperty('_id') && !doc._id) {
      delete doc._id
    }

    if (entity.id) {
      doc._id = entity.id
      delete doc.id
    }

    this.throwIfInvalid(doc)
    return doc
  }

  beforeUpdate (entity, _rev) {
    if (!_rev) {
      throw new Error('usage: beforeUpdate requires _rev')
    }
    const doc = cloneDeep(entity)
    doc._rev = _rev
    doc._id = entity.id
    delete doc.id

    this.throwIfInvalid(doc)
    return doc
  }

  async list () {
    const {docs} = await this.pouchDB.find({
      selector: {type: {'$eq': this.type}},
      limit: Number.MAX_SAFE_INTEGER
    })

    return docs.map(this.toEntity)
  }

  async get (id) {
    const doc = await this.pouchDB.get(id)
    return this.toEntity(doc)
  }

  async create (inputRow) {
    const doc = this.beforeCreate(inputRow)

    // confusing warning: pouch/couch return `id` on creates (and sometimes other functions)
    // but `_id` other times.
    // toEntity is going to expect an `_id` because normally docs have it.
    const response = await this.pouchDB.post(doc)
    const _id = doc._id || response.id
    return this.toEntity(Object.assign({_id}, doc))
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

    const {_rev} = await this.pouchDB.get(id)
    const doc = this.beforeUpdate(updatedRow, _rev)

    await this.pouchDB.put(doc)
    return updatedRow
  }

  // this can also returned a mixed bag of [{createdEntity, {error!}}]
  // because there are no "all or nothing" bulk insertions in couch,
  // some succeed, some might not.
  async createMany (inputRows) {
    const docs = inputRows.map(row => this.beforeCreate(row))

    const response = await this.pouchDB.bulkDocs(docs)
    // response is not the full doc,
    // but we need to get the {id} out of it in case pouch/couch
    // was expected to auto-create it.
    return inputRows.map((row, index) => {
      if (response[index].error || !response[index].ok) {
        return response[index]
      }

      const _id = response[index].id

      return this.toEntity(Object.assign({_id}, docs[index]))
    })
  }

  // TODO: this could be done in batches of like 500ish
  // for 10k+ updates to couch that will network fail
  async updateMany (rows) {
    const revsResponse = await this.pouchDB.find({
      selector: {_id: {'$in': rows.map(row => row.id)}},
      limit: Number.MAX_SAFE_INTEGER,
      fields: ['_id', '_rev']
    })
    const revsById = keyBy(revsResponse.docs, '_id')
    const docs = rows
      .map(row => this.beforeUpdate(row, get(revsById[row.id], '_rev')))

    // return the original row sent if there was no error
    const response = await this.pouchDB.bulkDocs(docs)
    return rows.map((row, index) => {
      if (response[index].error || !response[index].ok) {
        return response[index]
      }
      return this.toEntity(rows[index])
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

    return docs.map(doc => this.toEntity(doc))
  }

  // returns undefined if doesn't exist
  async findOne (selector) {
    const [doc] = await this.find(selector)
    return doc
      ? this.toEntity(doc)
      : undefined
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
