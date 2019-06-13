import React from 'react'
import './Header.css'
import ProfileDropdown from './ProfileDropdown'
import SettingsDialog from '../SettingsDialog'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import LoginPopup from '../LoginPopup'
import RegistrationDialog from '../RegistrationDialog'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  header: {
    backgroundColor: '#000'
  },
  whiteText: {
    color: '#fff',
    '&:hover': {
      color: '#bbb'
    }
  },
  toolbarButtons: {
    marginLeft: 'auto'
  },
  or: {
    color: '#fff',
    padding: theme.spacing(1)
  }
}))

function Header(props) {
  const classes = useStyles()
  const [showSettings, setShowSettings] = React.useState(false)
  const [showRegistration, setShowRegistration] = React.useState(false)

  function handleOpenSettings() {
    setShowSettings(true)
  }

  function handleCloseSettings() {
    setShowSettings(false)
  }

  function handleOpenRegistration() {
    setShowRegistration(true)
  }

  function handleCloseRegistration() {
    setShowRegistration(false)
  }

  const { setDarkTheme } = props

  return (
    <div className={classes.root}>
      <SettingsDialog open={showSettings} handleClose={handleCloseSettings} setDarkTheme={setDarkTheme} />
      <RegistrationDialog open={showRegistration} handleClose={handleCloseRegistration} />
      <AppBar position='static' className={classes.header}>
        <Toolbar>
          <Button className={classes.whiteText} href='/'>Home</Button>
          <div className={classes.toolbarButtons}>
            { window.is_logged_in ?
              <ProfileDropdown
                avatar={window.avatar_url}
                name={window.name}
                openSettings={handleOpenSettings}/>
              :
              <span>
                <LoginPopup openRegistration={handleOpenRegistration} />
                <span className={classes.or}>or</span>
                  <Button className={classes.whiteText} variant='text' onClick={handleOpenRegistration}>
                    Sign up
                  </Button>
              </span>
            }
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default Header