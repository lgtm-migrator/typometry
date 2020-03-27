import React from 'react'
import App from './App'
import { ThemeProvider } from '@material-ui/styles'
import ReactGA from 'react-ga'
import Header from './header/Header'
import { useMediaQuery } from '@material-ui/core'

class ThemedApp extends React.Component {
  constructor(props) {
    if (localStorage.getItem('useDarkTheme') === null) {
      localStorage.setItem('useDarkTheme', useMediaQuery('(prefers-color-scheme: dark)'))
    }
    super(props)
    this.state = {
      lightTheme: props.lightTheme,
      darkTheme: props.darkTheme,
      useDarkTheme: localStorage.getItem('useDarkTheme')
    }
    this.setUseDarkTheme = this.setUseDarkTheme.bind(this)
  }

  setUseDarkTheme(dark) {
    console.log('Use dark theme: ' + dark)
    ReactGA.event({
      category: 'Interaction',
      action: dark ? 'Enabled dark mode' : 'Disabled dark mode'
    })
    this.setState({useDarkTheme: dark})
  }

  render() {
    const { lightTheme, darkTheme, useDarkTheme } = this.state
    return (
      <div>
        <ThemeProvider theme={
          useDarkTheme ?
            darkTheme
            :
            lightTheme
        }>
          <Header setDarkTheme={this.setUseDarkTheme} />
          <App setDarkTheme={this.setUseDarkTheme} />
        </ThemeProvider>
      </div>
    )
  }
}

export default ThemedApp