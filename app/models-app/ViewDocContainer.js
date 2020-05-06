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
  loaded: false,
  editing: false
}

class ViewDocContainer extends React.Component {
  state = defaultState

  componentDidMount () {
    this.load()
  }

  componetWillUpdate (previousProps) {
    if (previousProps.match.params.modelType !== this.props.match.params.modelType ||
      previousProps.match.params.id !== this.props.match.params.id
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
      const docWithRelations = await this.api.get(id, {withRelations: true})
      const doc = await this.api.get(id)
      const original = asString(doc)
      const input = original
      this.setState({ doc, docWithRelations, input, original, loaded: true })
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
    const {match: {params: {couch, databaseName, modelType, id}}} = this.props
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
    const {match: {params: {couch, modelType, databaseName, id}}} = this.props
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
    const {match: {params: {couch, databaseName, modelType, id}}} = this.props
    const isNew = (id === 'create')
    const {
      loaded,
      valid,
      input,
      error,
      docWithRelations,
      isEditing
    } = this.state

    const canSave = valid

    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    if (!loaded) return <Loading message={`doc ${id}`} />

    if (!isEditing) {
      return (
        <div>
          <Link to={`${baseUrl}${modelType}/docs`}>back</Link>
          <div className='right-controls'>
            <button onClick={() => this.setState({isEditing: true})}>edit</button>
          </div>
          <ErrorDisplay back={`/${baseUrl}${modelType}/docs`} error={error} />
          <pre>{asString(docWithRelations)}</pre>
        </div>
      )
    }

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
          mode={'javascript'}
        />
      </div>
    )
  }
}

function asString (obj) {
  return JSON.stringify(obj, null, 2)
}

module.exports = ViewDocContainer
