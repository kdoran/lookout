const React = require('react')
const ReactDOM = require('react-dom')
const {Link} = require('react-router-dom')

const debounce = require('lodash/debounce')
const {Loading} = require('./Loading')

require('./search.css')

const defaultState = {rows: null, text: '', searching: false, hoverRowIndex: 0}

class Search extends React.Component {
  state = defaultState

  debouncedSearch = debounce(string => this.search(string), 200)

  async search (text) {
    this.setState({...defaultState, text})

    if (!text) {
      return
    }

    this.setState({searching: true})
    const body = JSON.stringify({selector: {_id: {'$regex': text}}, limit: 10, fields: ['_id']})
    const params = {method: 'post', body}
    const {docs} = await this.props.api.fetcher(`${this.props.dbName}/_find`, params)
    const rows = docs.map(row => row._id)
    this.setState({searching: false, rows})
  }

  handleOnChange = (event) => {
    this.debouncedSearch(event.target.value)
  }

  handleMouseEnter = id => {
    this.setState({hoverRowIndex: id})
  }

  handleKeyDown = (key, results) => {
    const {rows, hoverRowIndex} = this.state
    if (key === 'ArrowDown') {
      if (hoverRowIndex === (rows.length - 1)) {
        this.setState({ hoverRowIndex: 0 })
      }
      this.setState({ hoverRowIndex: hoverRowIndex + 1 })
    }

    if (key === 'ArrowUp') {
      if (hoverRowIndex < 0) {
        this.setState({ hoverRowIndex: rows.length - 1 })
      }
      this.setState({ hoverRowIndex: hoverRowIndex - 1 })
    }

    if (key === 'Enter' && rows[hoverRowIndex]) {
      this.props.onSelect(rows[hoverRowIndex])
    }
  }

  render () {
    const { rows, hoverRowIndex, text, searching } = this.state
    const { dbName, couch, onClose } = this.props

    return (
      <div onKeyDown={(e) => this.handleKeyDown(e.key)} tabIndex='0'>
        <h2>Doc Search: {dbName}</h2>
        <label>
          <input
            autoFocus
            placeholder='id regex without //'
            onChange={this.handleOnChange}
          />
        </label>
        {searching && (<Loading message={`_find id regex for ${text}`} />)}
        <div className='search--results'>
          {rows && rows.map((row, index) => {
            const active = hoverRowIndex === index
            return (<Link className={active ? 'active' : ''}
              key={row}
              to={`/${couch}/${dbName}/${encodeURIComponent(row)}`}
              onClick={() => onClose()}
              onMouseEnter={() => this.handleMouseEnter(index)}
            >{row}</Link>)
          })}
          {rows && rows.length === 0 && (<span>no results found for regex <strong>{text}</strong></span>)}
        </div>
      </div>
    )
  }
}

module.exports = {Search}
