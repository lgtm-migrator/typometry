import React from 'react'
import './Header.css'
import ProfileDropdown from './ProfileDropdown'
import { Button, Menu } from 'semantic-ui-react'

const Header = props => (
  <Menu inverted attached>
    <Menu.Item name='home' href='/' />

    <Menu.Menu position='right'>
      <Menu.Item>
        { props.loggedIn ?
          <ProfileDropdown
            avatar={window.avatar_url}
            name={window.name}/>
          :
          <Button primary href='/accounts/login'>Log in</Button>
        }
      </Menu.Item>
    </Menu.Menu>
  </Menu>
)

export default Header