import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Button,
  Switch,
  FormControlLabel,
  FormGroup
} from '@material-ui/core'
import ReactGA from 'react-ga'

function SettingsControls() {
  const [state, setState] = React.useState({
    darkMode: window.dark_theme,
    secondThing: false
  })

  const handleSwitchChange = name => event => {
    if (name === 'darkMode') {
      ReactGA.event({
        category: 'Interaction',
        action: event.target.checked ? 'Enabled dark mode' : 'Disabled dark mode'
      })
      console.log('Setting dark mode: ' + event.target.checked)
      window.dark_theme = event.target.checked
      window.setDarkTheme(event.target.checked)
    }
    setState({ ...state, [name]: event.target.checked })
  }

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={state.darkMode} onChange={handleSwitchChange('darkMode')} value='darkmode' />}
        label='Use dark theme'>
      </FormControlLabel>
    </FormGroup>
  )
}

function SettingsDialog(props) {
  const { open, handleClose } = props

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id='settings-dialog-title'>Settings</DialogTitle>
      <DialogContent>
        <SettingsControls/>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
