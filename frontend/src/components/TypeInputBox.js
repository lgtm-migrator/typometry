import React from 'react'
import './TypeInputBox.css'

const TypeInputBox = props => (
  <div className='typing-area'>
    <input autoFocus className='TypeInputBox' autoCapitalize='off' autoComplete='off' autoCorrect='off' {...props} />
  </div>
)

export default TypeInputBox
