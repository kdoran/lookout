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
  t.equals(shipment.source.name, 'a', 'sees relations populated on default')
  t.end()
})

// test('pouch adapter: list with hasOne relations', async t => {
//   const notes = await api.list()
//   t.ok(notes.length, 'lists some notes')
//   t.end()
// })

test('pouch adapter: teardown', async t => {
  return api.location.destroyDatabase()
})
