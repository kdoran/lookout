import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'

import { Link } from 'react-router-dom'
import './search-container.css'

// TODO: move to utils
const isExcluded = db => ['_global_changes', '_metadata', '_replicator'].indexOf(db) === -1

const SingleView = (props = {}) => {
  const docs = props.docs || []
  let url = id => props.dbUrl ? `${props.dbUrl}/${id}` : id

  return docs.map(doc => <Link className={props.currentItemId === doc._id ? 'active' : ''}
    key={doc._id}
    to={url(doc._id)}
    onMouseEnter={() => props.handleMouseEnter(doc._id)}
  >{doc._id}</Link>)
}

/**
 * Handle view for showing records gotten from different db
 * for multiple search query
 * @params dbs Object<{dbName: Array<doc>}>
 * @returns HTMLElement Array<SingleView>
 */
const MultipleView = (props = {}) => {
  const docs = props.docs || {}
  return Object.keys(docs).map(db =>
    <div key={db}>
      <h5>{db}</h5>
      <SingleView docs={docs[db]} dbUrl={db} currentItemId={props.currentItemId} handleMouseEnter={props.handleMouseEnter} />
    </div>)
}

export default class extends React.Component {
  state = {
    result: {},
    searching: false
  }

  fetcher (db, text, limit = 10) {
    const {couchUrl} = this.props
    const body = {
      selector: {
        _id: {
          '$regex': text
        }
      },
      limit
    }

    return fetcher.post(`${couchUrl}${db}/_find`, body)
      .then(result => ({db, docs: result.docs}))
    // catch incase of _user db permission
      .catch(() => Promise.resolve({db, docs: []}))
  }

  async search (text) {
    this.setState({searching: true})
    const {multipleSearch, dbs, db} = this.props

    let result = []
    if (multipleSearch) {
      result = await this.multipleSearch(text, dbs)
    } else {
      result = await this.singleSearch(text, db)
    }
    this.setState({searching: false, result})
  }

  // TODO: add debouce field here or Create a debouce input component
  handleOnChange = (event) => {
    const text = event.target.value
    if (text !== '') {
      this.search(text)
    } else {
      this.setState({result: {}})
    }
  }

  handleMouseEnter = id => {
    this.setState({currentItemId: id})
  }

  /**
   * Make result array to object and also removing empty result dbs
   * from result
   * @params results Array<{db:string, docs: Array<any>}>
   * @returns Object<{[db]: docs}>
   */
  _flattenResult (results) {
    const flatten = results.reduce((flat, pItem) => {
      if (pItem.docs.length > 0) {
        flat[pItem.db] = pItem.docs
      }
      return flat
    }, {})

    return flatten
  }

  async multipleSearch (text, dbs) {
    // limit as 3 each from each db since its a multiple search
    const promises = dbs
      .filter(db => isExcluded(db)) // exclude some dbs
      .map(db => this.fetcher(db, text, 3))

    const results = await Promise.all(promises)
    // flatten array result
    return this._flattenResult(results)
  }

  async singleSearch (text, db) {
    const result = await this.fetcher(db, text)
    return this._flattenResult([result])
  }

  render () {
    const { result, currentItemId, searching } = this.state
    const { multipleSearch, db, couchUrl } = this.props

    const commonAttr = {
      currentItemId,
      handleMouseEnter: this.handleMouseEnter
    }

    return (
      <div>
        <h2>Doc Search</h2>
        <label>
          <input
            autoFocus
            placeholder='id regex without //'
            onChange={this.handleOnChange}
          />
        </label>
        {searching && <Loading />}
        {!searching && <div className='search-drop-results'> {/* search result drop down */}
          {result && multipleSearch ? <MultipleView docs={result} couchUrl={couchUrl} {...commonAttr} /> : <SingleView docs={result[db]} {...commonAttr} /> }
        </div>}
      </div>
    )
  }
}
