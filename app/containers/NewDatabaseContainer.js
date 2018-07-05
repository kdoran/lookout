import React from 'react'
import Modal from 'components/Modal'
import fetcher from 'utils/fetcher'

export default class NewDatabaseContainer extends React.Component {
  state = { validDBName: false, loading: false, inputText: '', error: null }

  onInputChange = (e) => {
    const { value } = e.target
    this.setState({ validDBName: isValidDBName(value), inputText: value, error: null })
  }

  maybeEscape = (e) => {
    if (e.keyCode === 27) {
      this.setState({ inputText: '' })
      this.props.onClose()
    }
  }

  onSubmit = async (e) => {
    e.preventDefault()
    const { inputText, validDBName } = this.state
    const { couchUrl, history } = this.props
    const id = inputText
    if (validDBName) {
      this.setState({ loading: true })
      const data = { id, name: inputText }
      try {
        await fetcher.put(couchUrl + id, data)
        history.push(id)
      } catch (error) {
        this.setState({ error, loading: false })
      }
    }
  }

  render () {
    const { show, onClose } = this.props
    const { validDBName, loading, error, inputText } = this.state
    return (
      <Modal
        show={show}
        heading='Create New Database'
        onClose={onClose}
      >
        <form onSubmit={this.onSubmit}>
          <label>
            New Database
            <input
              type='text'
              placeholder='valid CouchDB name, a-z0-9_$()+-'
              autoFocus
              value={inputText}
              onChange={this.onInputChange}
              onKeyUp={this.maybeEscape}
            />
          </label>
          {error && (<div className='error'>{error}</div>)}
          <button
            className='action-button'
            disabled={!validDBName || loading}
            type='submit'
          >
            Submit
          </button>
          <button onClick={this.toggleModal}>cancel</button>
        </form>
      </Modal>
    )
  }
}

// regex from http://docs.couchdb.org/en/1.6.1/api/database/common.html
// without '/', because that broke things...
function isValidDBName (input) {
  const safeDBNameRegex = /^[a-z][a-z0-9_$()+-]*$/
  return safeDBNameRegex.test(input)
}
