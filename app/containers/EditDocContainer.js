import React from 'react'
import fetcher from 'utils/fetcher'
import DeleteDocModal from 'components/DeleteDocModal'
import Loading from 'components/Loading'
import { getCouchUrl } from 'utils/utils'
import Editor from 'components/Editor'

import './edit-doc-container.css'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { docId, couch } = props.match.params
    const { dbName, couchUrl } = getCouchUrl(props.match)
    this.state = {
      dbName,
      couchUrl,
      couch,
      docId: decodeURIComponent(docId),
      valid: true,
      original: '',
      input: '',
      changesMade: false,
      error: null,
      saving: false,
      showDeleteModal: false,
      loaded: false,
      isNew: docId === 'new'
    }
  }

  async componentDidMount () {
    const { couchUrl, dbName, docId, isNew } = this.state
    if (isNew) {
      this.setState({ loaded: true, original: '{}', input: neat({ _id: '' }) })
      return
    }
    try {
      const doc = await fetcher.dbGet(couchUrl, dbName, docId)
      const original = neat(doc)
      const input = original
      this.setState({ doc, input, original, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  onEdit = input => {
    const { original } = this.state
    let valid = true
    try {
      JSON.parse(input)
    } catch (e) {
      valid = false
    }
    this.setState({ valid, input, changesMade: (original !== input) })
  }

  onSubmit = () => {
    const { input, doc, isNew, couchUrl, dbName } = this.state
    const jsObjectInput = JSON.parse(input)
    this.setState({ saving: true }, () => {
      // New documents will get ID from input
      const docId = isNew ? jsObjectInput._id : this.state.docId
      fetcher.dbPut(couchUrl, dbName, docId, jsObjectInput).then(() => {
        this.setState({ docId }, () => this.back())
      }).catch(error => this.setState({ error, saving: false }))
    })
  }

  deleteDoc = () => {
    const { valid, input } = this.state
    if (valid) {
      const jsObjectInput = JSON.parse(input)
      jsObjectInput._deleted = true
      this.setState({ input: neat(jsObjectInput) }, () => {
        this.onSubmit()
      })
    }
  }

  back = () => {
    const { docId, couch, dbName } = this.state
    if (docId === 'new') {
      this.props.history.push(`/${couch}/${dbName}/`)
    } else {
      this.props.history.push(`/${couch}/${dbName}/${docId}`)
    }
  }

  render () {
    const {
      dbName,
      loaded,
      valid,
      input,
      original,
      changesMade,
      error,
      saving,
      isDesktop,
      isNew,
      docId,
      couchUrl,
      showDeleteModal
    } = this.state
    const buttonText = getSubmitButtonText(valid, changesMade, saving)
    const canSave = (valid && changesMade && !saving)

    return (
      <div>
        <h4>{dbName}</h4>
        <h2>{docId}</h2>
        {loaded ? (
          <div>
            <div className='controls'>
              <button
                disabled={!canSave}
                className={canSave ? 'action-button' : ''}
                onClick={canSave ? this.onSubmit : null}
              >
                {buttonText}
              </button>
              {!isNew && (
                <button
                  disabled={canSave}
                  onClick={() => this.setState({ showDeleteModal: true })}
                >
                  delete doc
                </button>
              )}
              <button
                className='cancel-button'
                onClick={() => this.back(this.state.docId)}
              >
                {changesMade ? 'cancel' : 'back'}
              </button>
            </div>
            {error && (<div className='error'>{error}</div>)}
            <Editor
              onChange={this.onEdit}
              value={input}
            />
            <DeleteDocModal
              show={showDeleteModal}
              onClose={() => { this.setState({ showDeleteModal: false }) }}
              couchUrl={couchUrl}
              dbName={dbName}
              docId={docId}
              onSubmit={this.deleteDoc}
            />
          </div>
        ) : <Loading />}
      </div>
    )
  }
}

function getSubmitButtonText (valid, changesMade, saving) {
  if (!valid) {
    return 'waiting for valid json...'
  } else if (changesMade) {
    if (saving) {
      return 'saving...'
    } else {
      return 'save changes?'
    }
  } else {
    return 'no changes made'
  }
}

function neat (obj) {
  return JSON.stringify(obj, null, 2)
}
