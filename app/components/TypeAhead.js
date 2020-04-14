import React from 'react'
import ClickOutHandler from 'react-onclickout'
// import h from 'utils/helpers'


class StaticInput extends React.Component {
  render () {
    const { label, value, onEditClick, className } = this.props
    let classes = className ? `${className} row` : 'row'
    return (
      <div className={classes}>
        <label>{label}</label>
        <div className='input-group'>
          <span>{value}</span>
          {(onEditClick && <span>&nbsp;(
            <a href='#' onClick={e => {e.preventDefault(); onEditClick()}}>change</a>)</span>)}
        </div>
      </div>
    )
  }
}

const LIMIT = 25

export default class TypeAhead extends React.Component {
  state = {
    showEdit: true,
    inputValue: '',
    localError: false,
    visibleRows: [],
    currIndex: 0,
    showSearch: false
  }

  componentDidMount = () => {
    this.setState({ visibleRows: this.props.rows.slice(0, LIMIT), showEdit: !this.props.value.name })
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({ showEdit: !newProps.value.name })
    if (newProps.rows) {
      this.setState({ visibleRows: newProps.rows.slice(0, LIMIT) })
    }
  }

  displayFunction = (value) => {
    return this.props.displayFunction
      ? this.props.displayFunction(value)
      : value.name
  }

  onKeyDown = (event) => {
    switch (event.key) {
      case 'Enter': {
        event.preventDefault()
        this.rowSelected(this.state.currIndex)
        break
      }
      case 'Escape': {
        if (this.props.value.name) {
          this.close()
        } else {
          this.hideSearch()
        }
        break
      }
      case 'ArrowDown': {
        if (this.state.currIndex === (this.state.visibleRows.length - 1)) {
          this.setState({ currIndex: 0 })
        } else {
          this.setState({ currIndex: this.state.currIndex + 1 })
        }
        break
      }
      case 'ArrowUp': {
        if (this.state.currIndex < 0) {
          this.setState({ currIndex: this.state.visibleRows.length - 1 })
        } else {
          this.setState({ currIndex: this.state.currIndex - 1 })
        }
        break
      }
      default: {
        this.showSearch()
      }
    }
  }

  onChange = (event) => {
    this.runSearch(event.currentTarget.value)
  }

  runSearch = (inputValue) => {
    const cleanedQuery = inputValue.toLowerCase().trim()
    const searchFunction = this.props.searchFilterFunction
      ? this.props.searchFilterFunction
      : (rows, input) => rows.filter(row => row.name.includes(input))

    const visibleRows = searchFunction(this.props.rows, cleanedQuery)
    this.setState({ inputValue, visibleRows, currIndex: 0 })
  }

  setCurrIndex = (event) => {
    this.setState({ currIndex: Number(event.target.dataset.index) })
  }

  close = () => {
    this.setState({ showEdit: false, showSearch: false })
  }

  open = () => {
    this.setState({ showEdit: true })
    this.showSearch()
  }

  showSearch = () => {
    if (!this.state.showSearch) this.setState({ showSearch: true })
    if (this.state.inputValue) {
      this.runSearch(this.state.inputValue)
    }
  }

  hideSearch = (event) => {
    if (this.state.showSearch) this.setState({ showSearch: false })
  }

  onClick = (event) => {
    event.stopPropagation()
    event.preventDefault()
    this.rowSelected(Number(event.currentTarget.dataset.index))
  }

  rowSelected = (index) => {
    if (index === this.state.visibleRows.length) {
      if (this.props.onNewSelected) {
        this.props.onNewSelected(this.state.inputValue)
      }
    } else {
      this.props.valueSelected(this.state.visibleRows[index])
    }
    this.hideSearch()
  }

  render () {
    const { inputValue, showEdit, currIndex, visibleRows, showSearch } = this.state
    const { value, label, resourceName, rows, onNewSelected, loading, autoFocus, stayOpen } = this.props
    const staticValue = this.displayFunction(value)
    console.log(staticValue)
    if (rows.find(row => !row.name)) {
      throw new Error(`search drop expects rows with a name property`)
    }

    if (!showEdit) {
      return (
        <StaticInput label={label} value={staticValue} onEditClick={this.open} />
      )
    }
    const detailsLinkClasses = currIndex === visibleRows.length ? 'active' : ''
    let classes = 'row'
    if (this.props.className) classes += ' ' + this.props.className
    return (
      <ClickOutHandler onClickOut={this.hideSearch}>
        <div className={classes}>
          <label>{label}</label>
          <div className='input-group'>
            <input
              onBlur={this.onBlur}
              value={inputValue}
              onKeyDown={this.onKeyDown}
              onChange={this.onChange}
              onFocus={this.showSearch}
              autoFocus
              type='text' />
            {(showSearch || stayOpen) && (
              <div className='search-drop-results'>
                {loading
                  ? (<div className='loader' />)
                  : (
                    <div>
                      {visibleRows.map((row, i) => {
                        const className = currIndex === i ? 'active' : ''
                        return (<a
                          data-index={i}
                          className={className}
                          key={i}
                          onMouseEnter={this.setCurrIndex}
                          onClick={this.onClick}
                        >
                          {this.displayFunction(row)}
                        </a>)
                      })}
                      <a
                        data-index={visibleRows.length}
                        onMouseEnter={this.setCurrIndex}
                        onClick={this.onClick}
                        className={detailsLinkClasses}
                      >
                        {resourceName}: {visibleRows.length} of {rows.length}
                        {onNewSelected && (<strong> | Add New {resourceName}</strong>)}
                      </a>
                    </div>
                  )
                }
              </div>
            )}
          </div>
        </div>
      </ClickOutHandler>
    )
  }
}
