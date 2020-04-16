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

const LIMIT = 100

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
      editorValue: getDefaultEditorValue()
    }
  }

  async componentDidMount () {
    const allDatabases = await this.props.lookoutApi.listAll()
    const databases = allDatabases.map(db => ({...db, name: `${db.url}${db.database}`}))
    this.setState({databases, loaded: true})
  }

  run = async (editorValue) => {
    if (!this.state.selectedDb) return

    this.setState({loading: true, docs: null})

    try {
      const db = this.props.lookoutApi.getPouchDB(this.state.couchLink)
      const selector = JSON.parse(editorValue)
      const {docs} = await db.find({selector})
      window.docs = docs
      console.log('docs available on variable `docs`', docs)
      this.setState({docs, loading: false, editorValue})
    } catch (error) {
      this.setState({error, loading: false, editorValue})
    }
  }

  dbSelected = (couchLink) => {
    this.setState({selectedDb: couchLink.name, couchLink})
  }

  onEscape = () => {
    this.setState({focusEditor: false, focusTypeAhead: true})
  }

  render () {
    const {
      databases, loading, editorValue, focusEditor, docs, selectedDb, focusTypeAhead
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
          value={editorValue}
          height='30%'
          onCmdEnter={this.run}
          focus={focusEditor && selectedDb}
          startRow={2}
          startColumn={15}
          mode={'json'}
          onEscape={this.onEscape}
        />
        {/* <label>
          <input type='radio' id='nolimit' name='limit' value='nolimit' />
          nolimit
        </label>
        <label><input type='radio' id='25' name='limit' value='25' />25</label>
        <label><input type='radio' id='500' name='limit' value='500' />500</label> */}
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
