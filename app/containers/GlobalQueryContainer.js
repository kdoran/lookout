const React = require('react')
const { Link } = require('react-router-dom')
const {
  Editor,
  Loading,
  ErrorDisplay,
  Breadcrumbs,
  AllowEditButton,
  TypeAhead
} = require('../components')

const {
  getQuery,
  getAllQueries,
  copyTextToClipboard,
  encode,
  decode,
  downloadJSON
 } = require('../utils/queries')

const LIMIT = 50

let resultsInConsoleCount = 1

class GlobalQueryContainer extends React.Component {
  constructor () {
    super()
    this.state = {
      databases: [],
      selectedDb: null,
      docs: null,
      error: null,
      focusEditor: false,
      loaded: false,
      loading: false,
      focusTypeAhead: true,
      input: getDefaultEditorValue()
    }
  }

  async componentDidMount () {
    const allDatabases = await this.props.lookoutApi.listAll()
    const databases = allDatabases.map(db => ({...db, name: `${db.url}${db.database}`}))
    this.setState({databases, loaded: true})
  }

  run = async () => {
    if (!this.state.selectedDb) return

    const { input } = this.state

    this.setState({loading: true, docs: null})

    try {
      const db = this.props.lookoutApi.getPouchDB(this.state.couchLink)
      const selector = JSON.parse(input)
      const {docs} = await db.find({selector, limit: Number.MAX_SAFE_INTEGER})
      const varName = `docs${resultsInConsoleCount}`
      window[varName] = docs
      resultsInConsoleCount++
      console.log(`restuls available on variable ${varName}`, docs)
      this.setState({docs, loading: false})
    } catch (error) {
      this.setState({error, loading: false})
    }
  }

  onEdit = async (input) => {
    this.setState({ input, error: '' })
  }

  dbSelected = (couchLink) => {
    this.setState({selectedDb: couchLink.name, couchLink})
  }

  onEscape = () => {
    this.setState({focusEditor: false, focusTypeAhead: true})
  }

  render () {
    const {
      databases, loading, input, focusEditor, docs, selectedDb, focusTypeAhead
    } = this.state

    return (
      <div>
        <TypeAhead
          rows={databases}
          value={{name: selectedDb}}
          valueSelected={this.dbSelected}
          label={'Select Database'}
          resourceName={'Database'}
          searchFilterFunction={filterFunction}
          autoFocus={focusTypeAhead}
        />
        <br />
        <br />
        <Editor
          value={input}
          height='30%'
          onCmdEnter={this.run}
          onChange={this.onEdit}
          // focus={focusEditor && selectedDb}
          startRow={2}
          startColumn={15}
          mode={'json'}
          onEscape={this.onEscape}
        />
        {loading
          ? <Loading />
          : docs &&
            <div>
              max {LIMIT} docs dislayed on browser
              <pre>
                {JSON.stringify(docs.slice(0, LIMIT), null, 2)}
              </pre>
            </div>
        }
      </div>
    )
  }
}

function getDefaultEditorValue () {
  return `{
  "_id": {
    "$regex": ""
  }
}`
}

function filterFunction (rows, input) {
  return rows.filter(row => fuzzyMatch(row.name, input))
}

function fuzzyMatch (name, input) {
  const pattern = input.replace(/\s+/g, '').split('').join('.*')
  return !!name.match(new RegExp(pattern, 'i'))
}

module.exports = {GlobalQueryContainer}
