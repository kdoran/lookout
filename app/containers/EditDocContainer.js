import React from 'react'
import DeleteDocModal from 'components/DeleteDocModal'
import Breadcrumbs from 'components/Breadcrumbs'
import Loading from 'components/Loading'
import Editor from 'components/Editor'

import './edit-doc-container.css'

export default class EditDocContainer extends React.Component {
  state = {
    valid: true,
    original: '',
    input: '',
    changesMade: false,
    error: null,
    saving: false,
    showDeleteModal: false,
    loaded: false
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const docId = decodeURIComponent(nextProps.match.params.docId)
    return { ...prevState, docId, isNew: docId === 'new' }
  }

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (prevProps) {
    const {dbUrl, match: {params: {docId}}, searchParams: {offset}} = this.props
    if (prevProps.dbUrl !== dbUrl
        || prevProps.searchParams.offset !== offset
        || prevProps.match.params.docId !== docId
      ) {
      this.load()
    }
  }

  load = async () => {
    const { couchUrl, dbName } = this.props
    const { docId, isNew } = this.state

    if (isNew) {
      this.setState({ loaded: true, original: '{}', input: neat({ _id: '' }) })
      return
    }

    try {
      const doc = await this.props.pouchDB.get(docId)
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

  onSubmit = async () => {
    const { couchUrl, dbName, couch } = this.props
    const { input, isNew } = this.state
    this.setState({saving: true})
    const jsObjectInput = JSON.parse(input)
    // New documents will get ID from input
    const docId = isNew ? jsObjectInput._id : this.state.docId

    try {
      const {id} = await this.props.pouchDB.put(jsObjectInput)
      this.props.history.push(`/${couch}/${dbName}/${id}`)
    } catch (error) {
      if (error.status === 400 && docId === '_security') {
        const body = JSON.stringify(jsObjectInput)
        await this.props.api.fetcher(`${dbName}/_security`, {method: 'PUT', body})
        this.props.history.push(`/${couch}/${dbName}/_security`)
        return
      }
      this.setState({ error, saving: false })
    }
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
    const { couch, dbName } = this.props
    const { docId } = this.state

    if (docId === 'new') {
      this.props.history.push(`/${couch}/${dbName}`)
    } else {
      this.props.history.push(`/${couch}/${dbName}/${docId}`)
    }
  }

  render () {
    const { couch, couchUrl, dbName } = this.props
    const {
      loaded,
      valid,
      input,
      changesMade,
      error,
      saving,
      isNew,
      docId,
      showDeleteModal
    } = this.state
    const buttonText = getSubmitButtonText(valid, changesMade, saving)
    const canSave = (valid && changesMade && !saving)

    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} docId={docId} final={'edit'} />

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
            {error && (<div className='error'>{JSON.stringify(error, null, 2)}</div>)}
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
