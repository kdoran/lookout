import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import { getCouchUrl } from 'utils/utils'
import { Link } from 'react-router-dom'

import './doc-container.css'

const aceHeight = '80%'
const aceWidth = '80%'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { docId } = props.match.params
    const { dbName, couchUrl } = getCouchUrl(props.match)
    this.state = {
      dbName,
      couchUrl,
      docId: decodeURIComponent(docId),
      doc: null,
      loaded: false,
      error: null,
      meta: null
    }
  }

  async componentDidMount () {
    const { couchUrl, dbName, docId } = this.state
    try {
      const search = this.props.location.search
      const resource = search ? docId + search : docId
      const doc = await fetcher.dbGet(couchUrl, dbName, resource)
      const metaResponse = await fetcher.dbGet(couchUrl, dbName, docId, { meta: true })
      const meta = {}
      for (let key in metaResponse) {
        if (!doc[key]) {
          meta[key] = metaResponse[key]
        }
      }
      const revs_info = meta._revs_info
      delete meta._revs_info
      this.setState({ doc, meta, revs_info, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  selectRev = (rev) => {
    const { params: { couch } } = this.props.match
    const { docId, dbName, couchUrl } = this.state
    this.props.history.push({
      pathname: `/${couch}/${dbName}/${encodeURIComponent(docId)}`,
      search: `?rev=${rev}`
    })
    // React router dom does not change route on query search param change
    window.location.reload()
  }

  render () {
    const { loaded, error, doc, meta, docId, dbName, couchUrl, revs_info } = this.state
    const { params: { couch } } = this.props.match
    return (
      <div>
        <h4>{dbName}</h4>
        <h2>{docId}</h2>
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <div className='controls'>
              <AllowEditButton
                dbName={dbName}
                couchUrl={couchUrl}
                onConfirm={() => this.props.history.push(`editing/${docId}`)}
              >
              edit
              </AllowEditButton>
            </div>
            <pre>
              {JSON.stringify(doc, null, 2)}
            </pre>
            <h5>Rev Links</h5>
            {revs_info.map(row => (
              <div key={row.rev}>
                <span>
                  {(row.status === 'available' && row.rev !== doc._rev)
                    ? (
                      <a href='#' onClick={e => {e.preventDefault(); this.selectRev(row.rev)}}>
                        {row.rev}
                      </a>
                    )
                    : row.rev
                  }
                </span>
                <span>
                  &nbsp; ({(row.rev === doc._rev) ? 'viewing' : row.status})
                </span>
              </div>
            ))}
            {Object.keys(meta).length ? (
              <div>
                <h5>Other Meta Info</h5>
                <pre>
                  {JSON.stringify(meta, null, 2)}
                </pre>
              </div>
            ) : <h5>No Conflicts Found.</h5>}
          </div>
        )}
      </div>
    )
  }
}
