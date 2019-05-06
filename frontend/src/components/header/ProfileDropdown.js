import React from 'react'
import { Dropdown, Image } from 'semantic-ui-react'


const UserDisplay = props => (
  <span>
    <Image avatar src={window.avatar_url} />
    &nbsp;{ props.name }
  </span>
)

const options = [
  { key: 'settings', text: 'Settings'},
  { key: 'logout', text: 'Log Out', href: '/accounts/logout' },
]

const ProfileDropdown = props => (
  <Dropdown
    fluid
    trigger={<UserDisplay {...props} />}
    options={options}
    pointing='top center'
    icon={null}/>
)

export default ProfileDropdown
