import React from 'react'
import Loading from 'components/Loading'
// import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import { Link } from 'react-router-dom'
import { downloadJSON } from 'utils/download'
import { copyTextToClipboard } from 'utils/utils'
import {omit, pick} from 'lodash'

import './doc-container.css'

export default class extends React.Component {
  state = {
    doc: null,
    loaded: false,
    // error: null,
    meta: null,
    docId: null
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const docId = decodeURIComponent(nextProps.match.params.docId)
    return { ...prevState, docId }
  }

  async componentDidMount () {
    const {api, couchUrl, dbName} = this.props
    const {rev} = this.props.match.params
    const {docId} = this.state
    const response = await api.base.get(docId, {meta: true})
      // .catch(error => this.setState({ error, loaded: true }))
    const doc = omit(response, ['_conflicts', '_revs_info'])
    const meta = pick(response, ['_conflicts', '_revs_info'])
    this.setState({ doc, meta, loaded: true })
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
    const { loaded, doc, meta, docId } = this.state

    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} docId={docId} final={rev} />
        {/* {error && <Error error={error} />} */}
        {!loaded && (<Loading />)}
        {loaded && (
          <div>
            <div className='controls'>
              <a href='#' onClick={this.download}>download</a> &nbsp;
              <a href='#' onClick={this.copy}>copy to clipboard</a> &nbsp;
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
            {meta && meta._revs_info && (
              <span>
                <h5>Rev Links</h5>
                {meta._revs_info.map(row => (
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
                {meta._conflicts ? (
                  <div>
                    <h5>Conflicts</h5>
                    {JSON.stringify(meta._conflicts, null, 2)}
                  </div>
                ) : <h5>No Conflicts Found.</h5>}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
}
