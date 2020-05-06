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
  error: null,
  loaded: false
}

class ViewModelContainer extends React.Component {
  state = defaultState

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (previousProps) {
    const {match: {params: {modelType, id}}} = this.props
    if (previousProps.match.params.modelType !== modelType || previousProps.match.params.id !== id) {
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
    let valid = true
    try {
      JSON.parse(input)
    } catch (e) {
      valid = false
    }
    this.setState({ valid, error: null, input })
  }

  onSubmit = async () => {
    const {api, match: {params: {databaseName, couch, id}}} = this.props
    const { input } = this.state

    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    const jsObjectInput = JSON.parse(input)
    try {
      (id === 'create')
        ? await api.create(jsObjectInput)
        : await api.update(jsObjectInput)

      window.alert(`Model ${jsObjectInput.name} saved.`)
      this.props.history.push(`${baseUrl}`)
    } catch (error) {
      console.error(error)
      this.setState({ error, saving: false })
    }
  }

  onDelete = async () => {
    const {api, match: {params: {databaseName, couch, id}}} = this.props
    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    const {doc} = this.state
    await api.destroy(id)
    window.alert(`Removed model ${doc.name} ${id}`)
    this.props.history.push(`${baseUrl}`)
  }

  render () {
    const {match: {params: {databaseName, couch, id}}} = this.props
    const isNew = (id === 'create')
    const {
      loaded,
      valid,
      input,
      error
    } = this.state

    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    const canSave = valid

    if (!loaded) return <Loading message='model definition' />

    return (
      <div>
        <Link to={`${baseUrl}`}>back</Link>
        <div className='right-controls'>
          <button
            disabled={!canSave}
            className={canSave ? 'action-button' : ''}
            onClick={canSave ? this.onSubmit : null}
          >
            save
          </button>
          {!isNew && (
            <button
              onClick={this.onDelete}
            >
              delete model definition
            </button>
          )}
        </div>
        {<ErrorDisplay back={`${baseUrl}`} error={error} />}
        <Editor
          onChange={this.onEdit}
          value={input}
        />
      </div>
    )
  }
}

function asString (obj) {
  return JSON.stringify(obj, null, 2)
}

module.exports = ViewModelContainer
