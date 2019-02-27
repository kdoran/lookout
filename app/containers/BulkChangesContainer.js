import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Breadcrumbs from 'components/Breadcrumbs'
import DiffEditorComponent from 'components/DiffEditorComponent'
import Modal from 'components/Modal'

import './bulk-changes-container.css'

export default class BulkChangesContainer extends React.Component {
  state = {
    loaded: true,
    error: null,
    rows: null,
    diffs: {},
    // comment this for testing
    // rows: getTestingFixtures(),
  }

  onChange = event => {
    const reader = new FileReader()
    reader.onload = event => this.handleJSON(event.target.result)
    reader.onerror = error => console.error(error)
    reader.readAsText(this.fileUpload.files[0])
  }

  handleJSON = async (text) => {
    const changeDocs = JSON.parse(text)
    const url = `${this.props.couchUrl}${this.props.dbName}/_all_docs?include_docs=true`
    const keys = changeDocs.map(doc => doc._id)
    const response = await fetcher.post(url, {keys})
    const currentDocsMap = response.rows
      .reduce((acc, row) => {
        acc[row.id] = row.doc
        return acc
      }, {})
    const rows = changeDocs
      .map(doc => ({
        _id: doc._id,
        changedDoc: doc,
        currentDoc: currentDocsMap[doc._id]
      }))

    this.setState({rows})
  }

  toggleDiff = (_id) => {
    const {diffs} = this.state
    if (diffs[_id]) {
      delete diffs[_id]
    } else {
      diffs[_id] = true
    }
    this.setState({diffs})
  }

  render () {
    const {couch} = this.props
    const {rows, diffs, error} = this.state
    return (
      <div className='bulk-changes-container'>
        <Breadcrumbs couch={couch} />
        {error ? <Error error={error} /> : (
          <div>
            <input
              type='file'
              onChange={this.onChange}
              ref={(ref) => this.fileUpload = ref}
            />
            {rows && (
              <div>
                {rows.map(row => (
                  <div key={row._id}>
                    {row.currentDoc ? (
                      <a href='#' onClick={e => {
                        e.preventDefault()
                        this.toggleDiff(row._id)
                      }}>
                        {row._id}
                      </a>
                    ): row._id}
                    {diffs[row._id] && (
                      <DiffEditorComponent value={[
                        JSON.stringify(row.currentDoc, null, 2),
                        JSON.stringify(row.changedDoc, null, 2)
                      ]} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

function getTestingFixtures () {
  return [
    {
      _id: 'test-id',
      changedDoc: {
        _id: 'test-id',
        valueA: 'changed',
        valueB: false
      },
      currentDoc: {
        _id: 'test-id',
        'valueA': 'test',
        'valueB': true
      }
    }
  ]
}
