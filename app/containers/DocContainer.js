import React from 'react'
import Loading from 'components/Loading'
import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import { Link } from 'react-router-dom'
import { downloadJSON } from 'utils/download'
import { copyTextToClipboard } from 'utils/utils'

import './doc-container.css'

export default class extends React.Component {
  state = {
    doc: null,
    loaded: false,
    error: null,
    _revs_info: [],
    _conflicts: [],
    docId: null
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const docId = decodeURIComponent(nextProps.match.params.docId)
    return { ...prevState, docId }
  }

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (newProps) {
    const {dbUrl, docId, searchParams: {offset}} = this.props
    const {match: {params: {rev}}} = this.props
    if (newProps.dbUrl !== dbUrl
        || newProps.searchParams.offset !== offset
        || newProps.docId !== docId
        || newProps.match.params.rev !== rev
      ) {
      this.load()
    }
  }

  load = async () => {
    const { pouchDB } = this.props
    const { rev } = this.props.match.params
    const { docId } = this.state
    try {
      // _revs_info & _conflicts are not returned if rev option is present,
      // so we always fetch those and if there's a rev url param, get the specific rev
      let doc = await pouchDB.get(docId, {revs_info: true, conflicts: true})
      const {_revs_info, _conflicts} = doc
      delete doc._revs_info
      delete doc._conflicts
      if (rev) {
        doc = await pouchDB.get(docId, {rev})
      }
      this.setState({ doc, _revs_info, _conflicts, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  download = event => {
    event.preventDefault()
    downloadJSON(this.state.doc, this.state.doc._id + ' _rev ' + this.state.doc._rev)
  }

  copy = e => {
    e.preventDefault()
    copyTextToClipboard(JSON.stringify(this.state.doc, null, 2))
  }

  handleConfirmEdit = () => {
    const {location} = this.props.history
    const pathname = location.pathname.charAt(location.pathname.length - 1) === '/'
      ? location.pathname.slice(0, -1) : location.pathname
    this.props.history.replace(`${pathname}/editing`)
  }

  render () {
    const { rev } = this.props.match.params
    const { couchUrl, dbName, couch } = this.props
    const { loaded, error, doc, _revs_info, _conflicts, docId } = this.state

    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} docId={docId} final={rev} />
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <div className='controls'>
              <a href='#' onClick={this.download}>download</a>
              <a href='#' onClick={this.copy}>copy to clipboard</a>
              <AllowEditButton
                dbName={dbName}
                couchUrl={couchUrl}
                onConfirm={this.handleConfirmEdit}
              >
              edit
              </AllowEditButton>
            </div>
            <pre>
              {JSON.stringify(doc, null, 2)}
            </pre>
              <span>
                <h5>Rev Links</h5>
                {_revs_info && _revs_info.map(row => (
                  <div key={row.rev}>
                    <span>
                      {(row.status === 'available' && (row.rev !== doc._rev))
                        ? (
                          <Link to={`/${couch}/${dbName}/${docId}/${row.rev}/`}>
                            {row.rev}
                          </Link>
                        )
                        : row.rev
                      }
                    </span>
                    <span>
                      &nbsp; ({(row.rev === doc._rev) ? 'viewing' : row.status})
                    </span>
                  </div>
                ))}
                {_conflicts && _conflicts.length ? (
                  <div>
                    <h5>Conflicts</h5>
                    {JSON.stringify(_conflicts, null, 2)}
                  </div>
                ) : <h5>No Conflicts Found.</h5>}
              </span>
          </div>
        )}
      </div>
    )
  }
}
