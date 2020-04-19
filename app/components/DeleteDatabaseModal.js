const React = require('react')
const {Modal} = require('./Modal')

class DeleteDatabaseModal extends React.Component {
  state = { dbNameConfirmed: false, inputText: '' }

  onInputChange = (e) => {
    const { value } = e.target
    const { dbName } = this.props
    this.setState({ dbNameConfirmed: (value === dbName), inputText: value })
  }

  onSubmit = async (e) => {
    e.preventDefault()
    if (this.state.dbNameConfirmed) {
      this.props.onConfirm()
    }
  }

  render () {
    const { show, onClose, couchUrl, dbName } = this.props
    const { dbNameConfirmed, inputText } = this.state
    return (
      <Modal
        show={show}
        onClose={this.props.onClose}
        className='warning-modal'
      >
        <form onSubmit={this.onSubmit}>
          <h1>Warning!! Delete database?</h1>
          <strong>{couchUrl}{dbName}</strong>
          <br /><br />
          <label>
            Type name of database to confirm delete. This cannot be undone.
            <input
              type='text'
              placeholder='name of database to delete'
              autoFocus
              value={inputText}
              onChange={this.onInputChange}
              onKeyUp={this.maybeEscape}
            />
          </label>
          <button
            className='action-button'
            disabled={!dbNameConfirmed}
            type='submit'
          >
            Submit
          </button>
          <button onClick={onClose}>cancel</button>
        </form>
      </Modal>
    )
  }
}

module.exports = {DeleteDatabaseModal}
