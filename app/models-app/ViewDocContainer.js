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

class ViewDocContainer extends React.Component {
  state = defaultState

  componentDidMount () {
    this.load()
  }

  componetWillUpdate (previousProps) {
    if (prevProps.match.params.modelType !== this.props.match.params.modelType ||
      prevProps.match.params.id !== prevProps.match.params.id
    ) {
      this.load()
    }
  }

  load = async () => {
    const {couchUrl, match: {params: {databaseName, id, modelType}}} = this.props
    this.api = await this.props.api.getDynamicApi(modelType, `${couchUrl}${databaseName}`)

    if (id === 'create') {
      const input = asString(this.api.createTemplate())
      this.setState({loaded: true, original: '{}', input})
      return
    }

    try {
      const doc = await this.api.get(id)
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
    this.setState({ valid, error: null, input })
  }

  onSubmit = async () => {
    const {match: {params: {couch, modelType, id}}} = this.props
    const { input } = this.state
    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    const jsObjectInput = JSON.parse(input)
    try {
      const resp = (id === 'create')
        ? await this.api.create(jsObjectInput)
        : await this.api.update(jsObjectInput)

      window.alert(`Model ${modelType} ${resp.id} saved.`)
      this.props.history.push(`${baseUrl}${modelType}/docs/`)
    } catch (error) {
      console.error(error)
      this.setState({ error, saving: false })
    }
  }

  onDelete = async () => {
    const {match: {params: {couch, databaseName, id}}} = this.props
    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    const {doc} = this.state
    await this.api.destroy(id)
    window.alert(`Removed model ${doc.name} ${id}`)
    this.props.history.push(`${baseUrl}${modelType}/docs`)
  }

  render () {
    const { match: {params: {couch, databaseName, modelType, id}}} = this.props
    const isNew = (id === 'create')
    const {
      loaded,
      valid,
      input,
      error
    } = this.state

    const canSave = valid

    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    if (!loaded) return <Loading message={`doc ${id}`} />

    return (
      <div>
        <Link to={`${baseUrl}${modelType}/docs`}>back</Link>
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
              disabled={canSave}
              onClick={this.onDelete}
            >
              delete doc
            </button>
          )}
        </div>
        {<ErrorDisplay back={`/${baseUrl}${modelType}/docs`} error={error} />}
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

module.exports = ViewDocContainer
