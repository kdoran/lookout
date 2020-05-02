const test = require('../../smalltest')
const {PouchAdapter, PouchDB} = require('../../../api')

const db = new PouchDB('integration-test-relations')
const locationSchema = {
  name: 'location',
  type: 'object',
  properties: {name: {type: 'string'}}
}

// TODO: test that required or not on relations still works as expected
const shipmentSchema = {
  name: 'shipment',
  type: 'object',
  properties: {date: {type: 'string', format: 'date-time'}}
}

const shipmentRelations = {
  hasOne: {
    source: {schema: locationSchema},
    destination: {schema: locationSchema}
  }
}

const api = {
  location: new PouchAdapter(locationSchema, db),
  shipment: new PouchAdapter(shipmentSchema, db, null, shipmentRelations)
}

test('pouch adapter: hasOne relations', async t => {
  const a = await api.location.create({name: 'a'})
  const b = await api.location.create({name: 'b'})
  const shipment = await api.shipment.create({
    date: new Date().toJSON(), sourceId: a.id, destinationId: b.id
  })
  const withRelations = await api.shipment.get(shipment.id, {withRelations: true})

  t.ok(
    withRelations.source.name === 'a' && withRelations.destination.name === 'b',
    'sees relations populated'
  )
  t.end()
})

test('pouch adapter: teardown', async t => {
  return api.location.destroyDatabase()
})
