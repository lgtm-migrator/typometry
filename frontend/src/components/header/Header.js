import React from 'react'
import './Header.css'
import { Button, Dropdown, Menu } from 'semantic-ui-react'

const Header = props => (
<Menu inverted attached>
    <Menu.Item name='home' href='/' />

    <Menu.Menu position='right'>
      <Menu.Item>
        <Button primary
                href={ props.loggedIn? '/accounts/logout' : '/accounts/login' }>
          { props.loggedIn? 'Log Out' : 'Log In' }</Button>
      </Menu.Item>
    </Menu.Menu>
  </Menu>
)

export default Header