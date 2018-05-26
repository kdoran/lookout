import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import { getCouchUrl } from 'utils/utils'
import { Link } from 'react-router-dom'

import './doc-container.css'

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
      const meta = await fetcher.dbGet(couchUrl, dbName, docId, { meta: true })
      this.setState({ doc, meta, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  render () {
    const { loaded, error, doc, meta, docId, dbName, couchUrl } = this.state
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
            {meta && meta._revs_info && (
              <span>
                <h5>Rev Links</h5>
                {meta._revs_info.map(row => (
                  <div key={row.rev}>
                    <span>
                      {(row.status === 'available')
                        ? (
                          <a href={`/${couch}/${dbName}/${encodeURIComponent(docId)}?rev=${row.rev}`}>
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
