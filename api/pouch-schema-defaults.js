const cloneDeep = require('lodash/cloneDeep')

const baseProperties = {
  type: {type: 'string'},
  // this is here but not required for the
  // option of having pouch/couch create the _id.
  _id: {type: 'string'},
  _rev: {type: 'string'},
  _deleted: {type: 'boolean'},
  createdAt: {
    type: 'string',
    format: 'date-time',
    default: () => new Date().toJSON()
  },
  createdBy: {
    type: 'string'
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    default: () => new Date().toJSON()
  },
  updatedBy: {
    type: 'string'
  }
}

const baseRequired = ['type', 'createdAt', 'createdBy']

function addSchemaDefaults (schema, relations = {}) {
  // TODO: throw if duplicates between the two
  const relationsSchemaProperties = Object.keys(relations.hasOne || {})
      .reduce((acc, relationName) => {
        acc[`${relationName}Id`] = {type: 'string'}
        return acc
      }, {})

  const properties = cloneDeep(Object.assign({}, baseProperties, relationsSchemaProperties, schema.properties))
  properties.type.default = schema.name

  const required = baseRequired.concat(schema.required || [])
  return Object.assign({}, schema, {properties, required})
}

module.exports = addSchemaDefaults
