import React from 'react'
import fetcher from 'utils/fetcher'

const textAreaStyles = {
  width: '90%',
  marginTop: '25px',
  height: '50%'
}

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      valid: true,
      original: JSON.stringify(props.doc, null, 2),
      input: JSON.stringify(props.doc, null, 2),
      changesMade: false,
      error: null,
      saving: false
    }
  }

  onEdit = input => {
    const { original } = this.state
    let valid = true
    try {
      JSON.parse(input)
    } catch (e) {
      valid = false
    }
    const changesMade = (original !== input)
    this.setState({ valid, input, changesMade })
  }

  onSubmit = () => {
    const { input } = this.state
    const { doc, couchUrl, dbName } = this.props
    const jsonInput = JSON.parse(input)
    this.setState({ saving: true }, () => {
      fetcher.dbPut(couchUrl, dbName, doc._id, jsonInput).then(({rev}) => {
        this.setState({ saving: false })
        this.props.docSaved(rev, jsonInput)
      }).catch(error => this.setState({ error, saving: false }))
    })
  }

  render () {
    const { valid, input, changesMade, error, saving } = this.state
    const { saved } = this.props
    let submitButton
    if (!valid) {
      submitButton = (<button disabled>invalid json</button>)
    } else if (changesMade) {
      if (saving) {
        submitButton = (<button disabled>saving...</button>)
      } else {
        submitButton = (<button onClick={this.onSubmit}> save </button>)
      }
    } else if (saved) {
      submitButton = (<button disabled> doc saved. </button>)
    } else {
      submitButton = (<button disabled> no changes made </button>)
    }
    return (
      <div>
        <textarea
          autoFocus
          style={textAreaStyles}
          onChange={e => this.onEdit(e.target.value)}
          value={input}
        />
        <div>
          <br />
          {submitButton}
        </div>
        {error && (
          <div className='error'>{error}</div>
        )}
      </div>
    )
  }
}
