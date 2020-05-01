const baseProperties = {
  type: {type: 'string'},
  // this is here but not required for the
  // option of having pouch/couch create the _id.
  _id: {type: 'string'},
  _rev: {type: 'string'},
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

function addSchemaDefaults (schema) {
  const properties = Object.assign({}, baseProperties, schema.properties)
  properties.type.default = schema.name

  const required = baseRequired.concat(schema.required || [])
  return Object.assign({}, schema, {properties, required})
}

module.exports = addSchemaDefaults
