const React = require('react')
const {Link} = require('react-router-dom')
const {
  Loading,
  Editor,
  ErrorDisplay
} = require('../components')
require('../containers/edit-doc-container.css')

const defaultState = {
  valid: true,
  original: '',
  input: '',
  changesMade: false,
  error: null,
  saving: false,
  loaded: false
}

class ViewModelContainer extends React.Component {
  state = defaultState

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (prevProps) {
    const {api, match: {params: {modelType, id}}} = this.props
    if (prevProps.match.params.modelType !== modelType || prevProps.match.params.id !== id) {
      this.load()
    }
  }

  load = async () => {
    const {api, match: {params: {id}}} = this.props
    // TODO: ace editor javascript mode wasn't working try upgrade
    // const input = api.createTemplateAsString()
    if (id === 'create') {
      const input = asString(api.createTemplate())
      this.setState({loaded: true, original: '{}', input})
      return
    }

    try {
      const doc = await this.props.api.get(id)
      const original = asString(doc)
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
    const {api, match: {params: {couch, id}}} = this.props
    const { input } = this.state
    this.setState({saving: true})

    const jsObjectInput = JSON.parse(input)
    // New documents will get ID from input

    try {
      const resp = (id === 'create') ? await api.create(jsObjectInput) : await api.update(jsObjectInput)
      this.props.history.push(`/${couch}/models/${resp.id}`)
    } catch (error) {
      console.error(error)
      this.setState({ error, saving: false })
    }
  }

  onDelete = async () => {
    const {api, match: {params: {couch, id}}} = this.props
    const {doc} = this.state
    await api.remove(id)
    window.alert(`Removed model ${doc.name} ${id}`)
    this.props.history.push(`/${couch}/models/`)
  }

  render () {
    const { match: {params: {couch, id}}} = this.props
    const isNew = (id === 'create')
    const {
      loaded,
      valid,
      input,
      changesMade,
      error,
      saving
    } = this.state

    const buttonText = getSubmitButtonText(valid, changesMade, saving)
    const canSave = changesMade && !saving

    if (!loaded) return <Loading message='model definition' />

    return (
      <div>
        <Link to={`/${couch}/models`}>back</Link>
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
        {<ErrorDisplay back={`/${couch}/models`} error={error} />}
        <Editor
          onChange={this.onEdit}
          value={input}
        />
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

module.exports = ViewModelContainer
