const React = require('react')
const AceEditor = require('react-ace').default
const brace = require('brace') // eslint-disable-line

require('brace/mode/json')
require('brace/mode/javascript')
require('brace/theme/github')

const ACE_HEIGHT = '80%'
const ACE_WIDTH = '100%'

class Editor extends React.Component {
  async componentDidMount () {
    this.editor = this.refs.aceEditor.editor
    this.editor.session.setOptions({ tabSize: 2 })
    this.editor.commands.removeCommands(['gotoline', 'find'])

    const {onCmdEnter, onSave} = this.props

    const commandKeys = [
      onCmdEnter && { // commands is array of key bindings.
        name: 'onCmdEnter', // name for the key binding.
        bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'}, // key combination used for the command.
        exec: () => onCmdEnter(this.editor.getValue()) // function to execute when keys are pressed.
      },
      onSave && { // commands is array of key bindings.
        name: 'onSave', // name for the key binding.
        bindKey: {win: 'Ctrl-s', mac: 'Command-s'}, // key combination used for the command.
        exec: () => onSave(this.editor.getValue()) // function to execute when keys are pressed.
      },
      { // commands is array of key bindings.
        name: 'onEscape', // name for the key binding.
        bindKey: {win: 'Esc', mac: 'Esc'}, // key combination used for the command.
        exec: () => this.editor.blur() // function to execute when keys are pressed.
      }
    ]

    this.editor.commands.addCommands(commandKeys)

    if (this.props.startRow) {
      this.editor.selection.moveTo(this.props.startRow, this.props.startColumn)
    }
  }

  cmdEnter = () => {
    if (this.props.onCmdEnter) {
      this.props.onCmdEnter(this.editor.getValue())
    }
  }

  render () {
    const {focus = true} = this.props
    return (
      <AceEditor
        mode='json'
        theme='github'
        ref='aceEditor'
        width={ACE_WIDTH}
        height={ACE_HEIGHT}
        focus={focus}
        showPrintMargin={false}
        editorProps={{$blockScrolling: true}}
        {...this.props}
      />
    )
  }
}

module.exports = {Editor}
