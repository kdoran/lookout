import React from 'react'
import Editor from 'components/Editor'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Breadcrumbs from 'components/Breadcrumbs'
import QueryResponse from 'components/QueryResponse'
import AllowEditButton from 'components/AllowEditButton'
import TypeAhead from 'components/TypeAhead'
import { getQuery, getAllQueries } from 'utils/queries'
import { copyTextToClipboard } from 'utils/utils'
import { encode, decode } from 'utils/url-params'
import { Link } from 'react-router-dom'
import { downloadJSON } from 'utils/download'

export default class GlobalQueryContainer extends React.Component {
  constructor () {
    super()
    this.state = {dbs: [], selectedDb: 'integrated-data'}
  }

  async componentDidMount () {
    const dbs = await this.props.api.listDatabases()
    this.setState({dbs})
  }

  run = async (result) => {
    if (!this.state.selectedDb) return
    const db = this.props.api.getPouchInstance(this.state.selectedDb)
    const selector = JSON.parse(result)
    const results = await db.find({selector})
    console.log(results)
  }

  dbSelected = ({name}) => {
    this.setState({selectedDb: name})
  }

  render () {
    const {dbs, selectedDb} = this.state

    return (
      <div>
        <TypeAhead
          rows={dbs.map(name => ({name}))}
          value={{name: selectedDb}}
          valueSelected={this.dbSelected}
          label={'Select Database'}
          resourceName={'Database'}
          autoFocus
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
        <label for='nolimit'>
          <input type='radio' id='nolimit' name='limit' value='nolimit' />
          nolimit
        </label>
        <label for='25'><input type='radio' id='25' name='limit' value='25' />25</label>
        <label for='500'><input type='radio' id='500' name='limit' value='500' />500</label>
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

