import React from 'react'
import Modal from 'components/Modal'

export default class DeteleDocModal extends React.Component {
  state = { confirmed: false, inputText: '' }

  onInputChange = (e) => {
    const { value } = e.target
    this.setState({ confirmed: (value === 'delete'), inputText: value, error: null })
  }

  maybeEscape = (e) => {
    if (e.keyCode === 27) {
      this.setState({ inputText: '' })
      this.props.onClose()
    }
  }

  render () {
    const { show, onClose, couchUrl, dbName, docId, onSubmit } = this.props
    const { confirmed, inputText } = this.state
    return (
      <Modal
        show={show}
        onClose={onClose}
        className='warning'
      >
        <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
          <h1>Delete document?</h1>
          <strong>{couchUrl}{dbName}/{docId}</strong>
          <br /><br />
          <label>
            Type "delete" to confirm.
            <input
              type='text'
              placeholder='delete'
              autoFocus
              value={inputText}
              onChange={this.onInputChange}
              onKeyUp={this.maybeEscape}
            />
          </label>
          <button
            className='action-button'
            disabled={!confirmed}
            type='submit'
          >
            Submit
          </button>
          <button onClick={() => onClose()}>cancel</button>
        </form>
      </Modal>
    )
  }
}
