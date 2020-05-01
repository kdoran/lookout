const keyBy = require('lodash/keyBy')
const cloneDeep = require('lodash/cloneDeep')
const get = require('lodash/get')
const SchemaInterface = require('./schema-interface')
const addSchemaDefaults = require('./pouch-schema-defaults')

class PouchAdapter extends SchemaInterface {
  constructor (schema, pouchDB, user, relations = {}) {
    if (typeof schema !== 'object' || !schema.properties || !schema.name) {
      throw new Error('PouchAdapter usage: schema object with {properties: {}, name} is required')
    }

    const withDefaults = addSchemaDefaults(schema, relations)
    super(withDefaults)
    this.type = schema.name
    this.user = user
    this.pouchDB = pouchDB
    this.relations = relations
  }

  get relationKeys () {
    return Object.keys(this.relations.hasOne || {}).concat(this.relations.hasMany || {})
  }

  get hasRelations () {
    console.log(this.relationKeys)
    return !!this.relationKeys.length
  }

  toModel (doc) {
    const model = cloneDeep(doc)
    if (doc._id) {
      model.id = doc._id
      delete model._id
    }
    delete model._rev
    return model
  }

  beforeCreate (model) {
    const doc = Object.assign(
      this.getSchemaDefaults(),
      cloneDeep(model)
    )
    if (doc.hasOwnProperty('_id') && !doc._id) {
      delete doc._id
    }

    if (model.id) {
      doc._id = model.id
      delete doc.id
    }

    this.throwIfInvalid(doc)
    return doc
  }

  beforeUpdate (model, _rev) {
    if (!_rev) {
      throw new Error('usage: beforeUpdate requires _rev')
    }
    const doc = cloneDeep(model)
    doc._rev = _rev
    doc._id = model.id
    delete doc.id

    this.throwIfInvalid(doc)
    return doc
  }

  async list (params = {}) {
    const options = Object.assign(
      {},
      {selector: {type: this.type}, limit: Number.MAX_SAFE_INTEGER},
      params
    )
    const {docs} = await this.pouchDB.find(options)
    return docs.map(this.toModel)
  }

  async get (id, options) {
    const withRelations = get(options, 'withRelations', true) && this.hasRelations
    console.log(withRelations)
    const doc = await this.pouchDB.get(id)
    if (!withRelations) {
      return this.toModel(doc)
    }

    return this.toModel(doc)
  }

  createTemplate () {
    return this.getSchemaDefaults()
  }

  async create (model) {
    const doc = this.beforeCreate(model)

    // confusing warning: pouch/couch return `id` on creates (and sometimes other functions)
    // but `_id` other times.
    // toModel is going to expect an `_id` because normally docs have it.
    const response = await this.pouchDB.post(doc)
    return this.get(response.id)
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

  // this can also returned a mixed bag of [{createdModel, {error!}}]
  // because there are no "all or nothing" bulk insertions in couch,
  // some succeed, some might not.
  async createMany (entities) {
    const docs = entities.map(row => this.beforeCreate(row))

    const response = await this.pouchDB.bulkDocs(docs)
    // response is not the full doc,
    // but we need to get the {id} out of it in case pouch/couch
    // was expected to auto-create it.
    return entities.map((row, index) => {
      if (response[index].error || !response[index].ok) {
        return response[index]
      }

      const _id = response[index].id

      return this.toModel(Object.assign({_id}, docs[index]))
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
      return this.toModel(rows[index])
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

    return docs.map(doc => this.toModel(doc))
  }

  // returns undefined if doesn't exist
  async findOne (selector) {
    const [doc] = await this.find(selector)
    return doc
      ? this.toModel(doc)
      : undefined
  }

  async count () {
    const {docs} = await this.pouchDB.find({
      selector: {type: this.type},
      limit: Number.MAX_SAFE_INTEGER,
      fields: ['_id']
    })
    return docs.length
  }

  destroyDatabase () {
    return this.pouchDB.destroy()
  }
}

module.exports = PouchAdapter
