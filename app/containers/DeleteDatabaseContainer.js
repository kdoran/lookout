import React from 'react'
import Modal from 'components/Modal'
import fetcher from 'utils/fetcher'

export default class DeleteDatabaseContainer extends React.Component {
  state = { dbNameConfirmed: false, loading: false, inputText: '', error: null }

  onInputChange = (e) => {
    const { value } = e.target
    const { dbName } = this.props
    this.setState({ dbNameConfirmed: (value === dbName), inputText: value, error: null })
  }

  maybeEscape = (e) => {
    if (e.keyCode === 27) {
      this.setState({ inputText: '' })
      this.props.onClose()
    }
  }

  onSubmit = async (e) => {
    e.preventDefault()
    const { inputText, dbNameConfirmed } = this.state
    const { couchUrl, history, couch } = this.props
    const id = inputText
    if (dbNameConfirmed) {
      this.setState({ loading: true })
      try {
        await fetcher.destroy(couchUrl + id)
        history.push(`/${couch}/`)
      } catch (error) {
        this.setState({ error, loading: false })
      }
    }
  }

  render () {
    const { show, onClose, couchUrl, dbName } = this.props
    const { dbNameConfirmed, loading, error, inputText } = this.state
    return (
      <Modal
        show={show}
        onClose={onClose}
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
          {error && (<div className='error'>{error}</div>)}
          <button
            className='action-button'
            disabled={!dbNameConfirmed || loading}
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
