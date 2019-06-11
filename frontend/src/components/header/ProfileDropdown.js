import React from 'react'
import { Avatar, Menu, MenuItem } from '@material-ui/core'
import axios from 'axios'


const options = [
  { key: 'settings', text: 'Settings'},
  { key: 'logout', text: 'Log Out', href: '/accounts/logout' },
]

function ProfileDropdown(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClickItem(event) {
    console.log('handleClickItem')
    if (event.target.id === 'settings') {
      props.openSettings()
    }
    else if (event.target.id === 'logOut') {
      const logoutEndpoint = '/rest-auth/logout/'
      axios.post(logoutEndpoint).then(res => {
        console.log(res.data)
      })
    }
    setAnchorEl(null)
  }

  return (
    <span>
      <Avatar
        src={window.avatar_url}
        component='div'
        onClick={handleClick} />
      <Menu id='avatar-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClickItem}>
        <MenuItem id='settings' onClick={handleClickItem}>Settings</MenuItem>
        <MenuItem id='logOut' onClick={handleClickItem}>Log Out</MenuItem>
      </Menu>
    </span>
  )
}

export default ProfileDropdown
