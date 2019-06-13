import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles(theme => ({
  close: {
    padding: theme.spacing(0.5)
  }
}))

function Notification(props) {
  const classes = useStyles()
  const [open, setOpen] = React.useState(true)
  const { message, action, onDismiss, forceOpen } = props

  function handleOpen() {
    setOpen(true)
  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return
    }
    onDismiss()
    setOpen(false)
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open || forceOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        message={<span id='message-id'>{message}</span>}
        action={[action,
          <IconButton
            key='close'
            color='inherit'
            className={classes.close}
            onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        ]}/>
    </div>
  )
}

export default Notification