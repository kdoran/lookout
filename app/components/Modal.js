import React from 'react'
import ClickOutHandler from 'react-onclickout'
import './modal.css'

export default function Modal ({ show, onClose, heading, children, className }) {
  const classes = 'modal ' + (className || '')
  return show
    ? <ClickOutHandler onClickOut={onClose}>
      <div className={classes}>
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
