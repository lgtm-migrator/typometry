import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  FormGroup
} from '@material-ui/core'

function SettingsControls(props) {
  const [state, setState] = React.useState({
    darkMode: window.dark_theme,
    secondThing: false
  })
  const { setDarkTheme } = props

  const handleSwitchChange = name => event => {
    if (name === 'darkMode') {
      console.log('Setting dark mode: ' + event.target.checked)
      window.dark_theme = event.target.checked
      setDarkTheme(event.target.checked)
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
  const { open, handleClose, setDarkTheme } = props

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id='settings-dialog-title'>Settings</DialogTitle>
      <DialogContent>
        <SettingsControls setDarkTheme={setDarkTheme} />
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
