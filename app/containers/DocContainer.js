const React = require('react')
const {
  Loading,
  ErrorDisplay,
  AllowEditButton,
  Breadcrumbs
} = require('components')
const { Link } = require('react-router-dom')
const { downloadJSON } = require('../utils/download')
const { copyTextToClipboard } = require('../utils/utils')

require('./doc-container.css')

class DocContainer extends React.Component {
  state = {
    doc: null,
    loaded: false,
    error: null,
    _revs_info: [],
    _conflicts: [],
    docId: null
  }

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (prevProps) {
    const {dbUrl, match: {params: {docId}}} = this.props
    const {match: {params: {rev}}} = this.props
    if (prevProps.dbUrl !== dbUrl ||
        prevProps.match.params.docId !== docId ||
        prevProps.match.params.rev !== rev
    ) {
      this.load()
    }
  }

  load = async () => {
    this.setState({loaded: false, error: null})
    const { pouchDB } = this.props
    const { rev } = this.props.match.params
    const docId = decodeURIComponent(this.props.match.params.docId)
    try {
      // _revs_info & _conflicts are not returned if rev option is present,
      // so we always fetch those and if there's a rev url param, get the specific rev
      let doc = await pouchDB.get(docId, {revs_info: true, conflicts: true})
      const {_revs_info, _conflicts} = doc // eslint-disable-line
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
    const { loaded, error, doc, _revs_info, _conflicts, docId } = this.state // eslint-disable-line

    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} docId={docId} final={rev} />
        {error && <ErrorDisplay error={error} />}
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
              {_revs_info && _revs_info.map(row => ( // eslint-disable-line
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

module.exports = {DocContainer}
