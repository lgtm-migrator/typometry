import React from 'react'
import './AppMenu.css'
import { Menu, Icon, Popup, Dropdown } from 'semantic-ui-react'

class AppMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      zoomHandler: this.props.zoomHandler,
      modeHandler: this.props.modeHandler,
      longTextHandler: this.props.longTextHandler,
    }
  }

  render() {
    const {
      zoomHandler,
      modeHandler,
      longTextHandler,
    } = this.state

    return (
      <Menu attached='top' size='large'>
        <Dropdown item text={this.props.modeText}>
          <Dropdown.Menu>
            <Dropdown.Item name='practice' text='Random Words' active={this.props.activeItem === 'practice'} onClick={modeHandler}/>
            { window.is_logged_in ?
              <Dropdown.Item name='smartExercise' text='Smart Exercise' active={this.props.activeItem === 'smartExercise'} onClick={modeHandler}/>
              :
              <Popup
                position='right center'
                content='You must log in to enable smart exercises.'
                trigger={ <span><Dropdown.Item disabled text='Smart Exercise'/></span> } />
            }
            <Dropdown.Item name='speedTest' text='Speed Test' active={this.props.activeItem === 'speedTest'} onClick={modeHandler}/>
            <Dropdown item text='Long Texts'>
              <Dropdown.Menu>
                <Dropdown item text='Books'>
                  <Dropdown.Menu>
                    <Dropdown.Item text='Alice in Wonderland' name='aliceInWonderland' active={this.props.longText === 'aliceInWonderland'} onClick={longTextHandler}/>
                    <Dropdown.Item text='Metamorphosis' name='metamorphosis' active={this.props.longText === 'metamorphosis'} onClick={longTextHandler}/>
                    <Dropdown.Item text='The Adventures of Tom Sawyer' name='tomSawyer' active={this.props.longText === 'tomSawyer'} onClick={longTextHandler}/>
                  </Dropdown.Menu>
                </Dropdown>
              </Dropdown.Menu>
            </Dropdown>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Menu position='right'>
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
