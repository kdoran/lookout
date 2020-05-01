const React = require('react')
const {
  DeleteDocModal,
  Loading,
  Editor
} = require('../components')

require('../containers/edit-doc-container.css')

const defaultState = {
  valid: true,
  original: '',
  input: '',
  changesMade: false,
  error: null,
  saving: false,
  showDeleteModal: false,
  loaded: false
}

class ViewModelDefinitionContainer extends React.Component {
  state = defaultState

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (prevProps) {
    const {entityName, match: {params: {entityId}}} = this.props
    if (prevProps.entityName !== entityName ||
        prevProps.match.params.entityId !== entityId
    ) {
      console.log('wtf')
      this.load()
    }
  }

  load = async () => {
    const {api, match: {params: {modelType}}} = this.props
    this.setState({loaded: true, original: '{}', input: asString({ modelType: '' })})


    // if (!docId) {
    //   this.setState({ loaded: true, original: '{}', input: asString({ _id: '' }) })
    //   return
    // }
    //
    // try {
    //   const doc = await this.props.api.get(docId)
    //   const original = asString(doc)
    //   const input = original
    //   this.setState({ doc, input, original, loaded: true })
    // } catch (error) {
    //   this.setState({ error, loaded: true })
    //   console.error(error)
    // }
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
    const { dbName, couch } = this.props
    const { input, isNew } = this.state
    this.setState({saving: true})
    const jsObjectInput = JSON.parse(input)
    // New documents will get ID from input
    const docId = isNew ? jsObjectInput._id : this.state.docId

    try {
      await this.props.api.create(jsObjectInput)
      // this.props.history.push(`/${couch}/${dbName}/${id}`)
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

  onDelete = () => {
    const { valid, input } = this.state
    if (valid) {
      const jsObjectInput = JSON.parse(input)
      jsObjectInput._deleted = true
      this.setState({ input: asString(jsObjectInput) }, () => {
        this.onSubmit()
      })
    }
  }

  render () {
    const { couchUrl, dbName } = this.props
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
        {loaded ? (
          <div>
            <div className='right-controls'>
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
                  onClick={this.onDelete}
                >
                  delete entity
                </button>
              )}
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

function asString (obj) {
  return JSON.stringify(obj, null, 2)
}

module.exports = ViewModelDefinitionContainer
