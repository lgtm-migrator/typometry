import React from 'react'
import './AppMenu.css'
import { Menu,  Dropdown, Icon, Popup } from 'semantic-ui-react'

class AppMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      zoomHandler: this.props.zoomHandler,
      modeHandler: this.props.modeHandler
    }
  }

  render() {
    const {
      zoomHandler,
      modeHandler
    } = this.state

    return (
      <Menu attached='top' size='large'>
        <Menu.Item name='practice' active={this.props.activeItem === 'practice'} onClick={modeHandler}/>
        { window.is_logged_in ?
          <Menu.Item name='smartExercise' active={this.props.activeItem === 'smartExercise'} onClick={modeHandler}/>
          :
          <Popup
            content='You must log in to enable smart exercises.'
            trigger={ <Menu.Item disabled name='smartExercise'/> } />
        }
        <Menu.Item name='speedTest' active={this.props.activeItem === 'speedTest'} onClick={modeHandler}/>
        <Menu.Menu position='right'>
          <Dropdown item text='Language'>
            <Dropdown.Menu>
              <Dropdown.Item>English</Dropdown.Item>
              <Dropdown.Item>Russian</Dropdown.Item>
              <Dropdown.Item>Spanish</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Menu.Item
            name='zoom in'
            onClick={zoomHandler}>
            <Icon.Group>
              <Icon name='font' />
              <Icon corner='top right' name='plus' />
            </Icon.Group>
          </Menu.Item>
          <Menu.Item
            name='zoom out'
            onClick={zoomHandler}>
            <Icon.Group>
              <Icon name='font' />
              <Icon corner='top right' name='minus' />
            </Icon.Group>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  }
}

export default AppMenu
