const React = require('react')

const styles = {
  textAlign: 'center'
}

class Loading extends React.Component {
  render () {
    return (
      <h3 style={styles}>
        loading...
      </h3>
    )
  }
}

module.exports = {Loading}
