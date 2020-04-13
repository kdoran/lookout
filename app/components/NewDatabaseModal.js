import React from 'react'
import Modal from 'components/Modal'

export default class NewDatabaseModal extends React.Component {
  state = { validDBName: false, inputText: '' }

  onInputChange = (e) => {
    const { value } = e.target
    this.setState({ validDBName: isValidDBName(value), inputText: value })
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
    if (validDBName) {
      this.props.onCreateDatabase(inputText)
    }
  }

  render () {
    const { show, onClose } = this.props
    const { validDBName, inputText } = this.state
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
          <button
            className='action-button'
            disabled={!validDBName}
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
