import React from 'react'
import './TypeInputBox.css'
import { TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  textField: {
    width: 350,
    maxWidth: '100%',
  }
}))

function TypeInputBox(props) {
  const classes = useStyles()
  return (
      <TextField
        inputProps={{
          style: {
            fontFamily: 'Times New Roman',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '2em',
            marginTop: '-15px',
            marginBottom: '-5px'
          }
        }}
        margin='normal'
        autoFocus
        ref={props.inputRef}
        className={classes.textField}
        autoCapitalize='off'
        autoComplete='off'
        autoCorrect='off'
        {...props} />
  )
}

export default TypeInputBox
