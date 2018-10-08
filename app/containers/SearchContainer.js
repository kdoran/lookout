import React from 'react'
import fetcher from 'utils/fetcher'
import { debounce } from 'utils/utils'
import Loading from 'components/Loading'

import { Link } from 'react-router-dom'
import ReactDOM from 'react-dom'
import './search-container.css'

// TODO: move to utils
const isExcluded = db => ['_global_changes', '_metadata', '_replicator'].indexOf(db) === -1

const SingleView = (props = {}) => {
  const docs = props.docs || []
  let url = id => props.dbUrl ? `${props.dbUrl}/${id}` : id
  const isActive = id => props.currentItemId === id
  return docs.map(doc => <Link className={isActive(doc._id) ? 'active' : ''}
    key={doc._id}
    to={url(doc._id)}
    onMouseEnter={() => props.handleMouseEnter(doc._id)}
    ref={link => link && isActive(doc._id) && ReactDOM.findDOMNode(link).focus()}
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

  handleOnChange = (event) => {
    const text = event.target.value
    if (text !== '') {
      const searchFunc = debounce(string => this.search(string))
      searchFunc(text)
    } else {
      this.setState({result: {}})
    }
  }

  handleMouseEnter = id => {
    this.setState({currentItemId: id})
  }

  handleKeyDown = (key, results) => {
    let currentItemId
    if (key === 'ArrowDown') {
      currentItemId = this._getItem()
    }

    if (key === 'ArrowUp') {
      currentItemId = this._getItem(-1)
    }

    this.setState({currentItemId})
  }

  _getItem (movement = 1) {
    const {result, currentItemId} = this.state
    // create a single array of results
    const dbDocs = Object.keys(result).reduce((array, db) => {
      return array.concat(result[db])
    }, [])

    const index = dbDocs.findIndex(({_id}) => _id === currentItemId)
    const item = dbDocs[index + movement]
    if (item) {
      return item._id
    }
    return currentItemId
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
      <div onKeyDown={(e) => this.handleKeyDown(e.key, result)} tabIndex='0'>
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
