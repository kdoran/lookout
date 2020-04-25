const React = require('react')

const styles = {
  textAlign: 'center'
}

class Loading extends React.Component {
  render () {
    const {message = ''} = this.props
    return (
      <h3 style={styles}>
        loading {message}...
      </h3>
    )
  }
}

module.exports = {Loading}
