import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'

import { Link } from 'react-router-dom'

// TODO: move to utils
const isExcluded = db => ['_global_changes', '_metadata', '_replicator'].indexOf(db) === -1

const SingleView = (props = {}) => {
  const docs = props.docs || []
  return docs.map(doc => <a key={doc._id}>{doc._id}</a>)
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
      <SingleView docs={docs[db]} />
    </div>)
}

export default class extends React.Component {
  state = {
    result: {},
    searching: false
  }

  fetcher (couchUrl, db, text, limit = 10) {
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
    const {multipleSearch, dbs, db, couchUrl} = this.props

    let result = []
    if (multipleSearch) {
      result = await this.multipleSearch(text, dbs, couchUrl)
    } else {
      result = await this.singleSearch(text, db, couchUrl)
    }
    this.setState({searching: false, result})
  }

  handleOnChange = (event) => {
    const text = event.target.value
    // TODO: add debouce field here
    this.search(text)
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

  async multipleSearch (text, dbs, couchUrl) {
    // limit as 3 each from each db since its a multiple search
    const promises = dbs
      .filter(db => isExcluded(db)) // exclude some dbs
      .map(db => this.fetcher(couchUrl, db, text, 3))

    const results = await Promise.all(promises)
    // flatten array result
    return this._flattenResult(results)
  }

  async singleSearch (text, db, couchUrl) {
    const result = await this.fetcher(couchUrl, db, text)
    return this._flattenResult([result])
  }

  render () {
    const { result } = this.state
    const { multipleSearch, db } = this.props

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
        <div> {/* search result drop down */}
          {result && multipleSearch ? <MultipleView docs={result} /> : <SingleView docs={result[db]} /> }
        </div>
      </div>
    )
  }
}
