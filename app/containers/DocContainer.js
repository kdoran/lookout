import React from 'react'
import {Link} from 'react-router-dom'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import EditDocContainer from 'containers/EditDocContainer'
import { getCouchUrl } from 'utils/utils'

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
      editing: false,
      docEditsSaved: false
    }
  }

  async componentDidMount () {
    const {couchUrl, dbName, docId} = this.state
    try {
      const doc = await fetcher.dbGet(couchUrl, dbName, docId)
      this.setState({ doc, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  docSaved = (_rev, updatedDoc) => {
    const doc = { ...updatedDoc, _rev }
    this.setState({ doc, docEditsSaved: true })
  }

  render () {
    const { loaded, error, doc, docId, editing, dbName, couchUrl, docEditsSaved } = this.state
    const { params: { couch } } = this.props.match
    return (
      <div>
        <h1>{docId}</h1>
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <pre>
              {JSON.stringify(doc, null, 2)}
            </pre>
            {
              editing ? (
                <button onClick={() => this.setState({ editing: false })} >cancel</button>
              )
                : (
                  <AllowEditButton
                    dbName={dbName}
                    couchUrl={couchUrl}
                    onConfirm={() => this.setState({ editing: true })}
                  >
                  edit
                  </AllowEditButton>
                )
            }
            {editing && (
              <div>
                <EditDocContainer
                  key={doc._rev}
                  couchUrl={couchUrl}
                  dbName={dbName}
                  doc={doc}
                  docSaved={this.docSaved}
                  saved={docEditsSaved}
                />
              </div>
            )}
            <div className='footer'>
              <Link to={`/${couch}/${dbName}`}>docs</Link>
            </div>
          </div>
        )}
      </div>
    )
  }
}
