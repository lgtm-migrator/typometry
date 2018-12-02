import React from 'react'
import './TypeInputBox.css'

const TypeInputBox = props => (
  <div className='TypeInputBox'>
    <input autoFocus autoCapitalize='off' autoComplete='off' autoCorrect='off' {...props} />
  </div>
)

export default TypeInputBox
