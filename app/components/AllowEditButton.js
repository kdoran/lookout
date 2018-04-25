import React from 'react'
import Modal from './Modal'

export default class extends React.Component {
  state = { showModal: false, inputText: '', allowEdit: false }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal })
  }

  onInputChange = (e) => {
    const {value} = e.target
    this.setState({ allowEdit: (value === 'edit'), inputText: value })
  }

  maybeEscape = (e) => {
    if (e.keyCode === 27) {
      this.setState({ inputText: '', showModal: false })
    }
  }

  onSubmit = (e) => {
    e.preventDefault()
    const {inputText} = this.state
    if (inputText === 'edit') {
      this.setState({ showModal: false, inputText: '' })
      this.props.onConfirm()
    }
  }

  render () {
    const { showModal, inputText, allowEdit } = this.state
    const { children, dbName, couchUrl } = this.props
    return (
      <span>
        <button onClick={this.toggleModal}>
          {children}
        </button>
        <Modal
          show={showModal}
          onClose={this.toggleModal}
        >
          <h2>Warning! Allow edits to database?</h2>
          <div>
          Please take a moment to confirm your CouchDB and database:
            <div>
              <br />
              <strong>{couchUrl}{dbName}</strong>
            </div>
          </div>
          <br />
          <form onSubmit={this.onSubmit}>
            <label>
            type "edit" to continue
              <input
                type='text'
                placeholder='edit'
                autoFocus
                value={inputText}
                onChange={this.onInputChange}
                onKeyUp={this.maybeEscape}
              />
            </label>
            <button disabled={!allowEdit} type='submit'>Submit</button>
            <button onClick={this.toggleModal}>cancel</button>
          </form>
        </Modal>
      </span>
    )
  }
}
