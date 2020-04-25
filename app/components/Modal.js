const React = require('react')
const ClickOutHandler = require('react-onclickout')
require('./modal.css')

function Modal ({ show, onClose, heading, children, className }) {
  const classes = 'modal ' + (className || '')

  const handleOnKeyDown = event => {
    if (event.key === 'Escape') {
      onClose(event)
    }
  }

  return show
    ? <ClickOutHandler onClickOut={onClose}>
      <div className={classes} onKeyDown={handleOnKeyDown} tabIndex='0'>
        <div>
          <button className='close' onClick={onClose}><span>×</span></button>
          <h5>{heading}</h5>
        </div>
        <div>
          {children}
        </div>
      </div>
    </ClickOutHandler>
    : null
}

module.exports = {Modal}
