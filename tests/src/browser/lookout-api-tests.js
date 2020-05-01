// const test = require('../../smalltest')
// const  = require('../../../app/lookout-api')
//
// let api
// test('pouch adapter: constructor', async t => {
//   const schema = {
//     name: 'note',
//     type: 'object',
//     properties: {
//       text: {
//         type: 'string',
//         minLength: 1
//       }
//     },
//     required: ['text']
//   }
//   const db = new PouchDB('integration-test-db-name')
//   api = new PouchAdapter(schema, db)
//   t.equals(api.type, 'note', 'creates an pouch adapter with a type')
// })
//
// test('pouch adapter: create', async t => {
//   const note = await api.create({text: 'some text'})
//   t.equals(note.text, 'some text', 'creates an entity')
//   t.equals(note.type, 'note', 'default creates a type')
//   t.ok(note.id, 'creates an id')
//   t.end()
// })
//
// test('pouch adapter: get', async t => {
//   const note = await api.create({text: 'some text'})
//   const noteSecond = await api.get(note.id)
//   t.equals(note.text, noteSecond.text, 'gets a note by id')
//   t.end()
// })
//
// test('pouch adapter: list', async t => {
//   const notes = await api.list()
//   t.ok(notes.length, 'lists some notes')
//   t.end()
// })
//
// test('pouch adapter: update', async t => {
//   const note = await api.create({text: 'some text'})
//   const noteUpdated = await api.update({...note, text: 'changed'})
//   t.equals(noteUpdated.text, 'changed', 'updates a note by id')
//   t.end()
// })
//
// test('pouch adapter: delete', async t => {
//   const note = await api.create({text: 'some text'})
//   await api.remove(note.id)
//   try {
//     await api.get(note.id)
//     t.fail()
//   } catch (error) {
//     t.ok(error, 'cannot find note after remove')
//   }
//   t.end()
// })
//
// test('pouch adapter: create many', async t => {
//   const notes = await api.createMany([{text: 'some text'}, {text: 'some text again'}])
//   t.equals(notes.length, 2, 'creates some notes')
//   t.end()
// })
//
// test('pouch adapter: update many', async t => {
//   const notes = await api.createMany([{text: 'some text'}, {text: 'some text again'}])
//   const updatedNotes = await api.updateMany(notes.map(note => ({...note, text: 'changed'})))
//   t.ok(updatedNotes.every(note => note.text === 'changed'), 'bulk updates notes')
//
//   const note = await api.get(updatedNotes[0].id)
//   t.equals(note.text, 'changed', 'changed notes in db')
//   t.end()
// })
//
// test('pouch adapter: destroy / teardown', async t => {
//   await api.destroyDatabase()
//   try {
//     await api.list()
//     t.fail()
//   } catch (error) {
//     t.ok(error, 'api throws error')
//     t.end()
//   }
// })
