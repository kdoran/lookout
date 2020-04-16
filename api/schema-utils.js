const baseProperties = {
  // TODO: id vs _id vs ug.
  type: {type: 'string'},
  id: {type: 'string'},
  createdAt: {
    type: 'string',
    format: 'date-time',
    default: new Date().toJSON()
  },
  createdBy: {type: 'string'},
  updatedAt: {
    type: 'string',
    format: 'date-time',
    default: new Date().toJSON()
  },
  updatedBy: {type: 'string'}
}

const baseRequired = ['id', 'type']

module.exports = {
  baseProperties,
  baseRequired
}
