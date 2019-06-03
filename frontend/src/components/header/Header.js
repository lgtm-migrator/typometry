import React from 'react'
import './Header.css'
import ProfileDropdown from './ProfileDropdown'
import SettingsDialog from '../SettingsDialog'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  header: {
    backgroundColor: '#000'
  },
  spacer: {
    flexGrow: 1
  },
  whiteText: {
    color: '#fff',
    '&:hover': {
      color: '#bbb'
    }
  }
}))

function Header(props) {
  const classes = useStyles()
  const [showSettings, setShowSettings] = React.useState(false)

  function handleOpenSettings() {
    setShowSettings(true)
  }

  function handleCloseSettings() {
    setShowSettings(false)
  }

  return (
    <div className={classes.root}>
      <SettingsDialog open={showSettings} handleClose={handleCloseSettings} />
      <AppBar position='static' className={classes.header}>
        <Toolbar>
          <Button className={classes.whiteText} href='/'>Home</Button>
          <div className={classes.spacer}/>
          { props.loggedIn ?
            <ProfileDropdown
              avatar={window.avatar_url}
              name={window.name}
              openSettings={handleOpenSettings}/>
            :
            <Button className={classes.whiteText} href='/accounts/login'>Log in</Button>
          }
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default Header