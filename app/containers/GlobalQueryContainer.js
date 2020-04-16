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
      dbs: [],
      selectedDb: 'integrated-data',
      docs: null,
      error: null,
      focusEditor: true
    }
  }

  async componentDidMount () {
    const dbs = await this.props.api.listDatabases()
    this.setState({dbs})
  }

  run = async (result) => {
    if (!this.state.selectedDb) return

    this.setState({loading: true, docs: null})

    try {
      const db = this.props.api.getPouchInstance(this.state.selectedDb)
      const selector = JSON.parse(result)
      const {docs} = await db.find({selector})
      this.setState({docs, loading: false})
    } catch (error) {
      this.setState({error, loading: false})
    }
  }

  dbSelected = ({name}) => {
    this.setState({selectedDb: name})
  }

  onEscape = () => {
    console.log('anything')
    this.setState({focusEditor: !this.state.focusEditor})
  }

  render () {
    const {dbs, focusEditor, docs, selectedDb} = this.state

    return (
      <div>
        <TypeAhead
          rows={dbs.map(name => ({name}))}
          value={{name: selectedDb}}
          valueSelected={this.dbSelected}
          label={'Select Database'}
          resourceName={'Database'}
          // autoFocus={!focusEditor}
        />
        <br />
        <br />
        <Editor
          value={getDefaultString()}
          height='30%'
          onCmdEnter={this.run}
          focus={!!selectedDb}
          startRow={2}
          startColumn={15}
          mode={'json'}
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

function getDefaultString () {
  return `{
  "_id": {
    "$regex": ""
  }
}`
}

module.exports = {GlobalQueryContainer}
