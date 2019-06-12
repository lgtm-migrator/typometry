import React from 'react'
import App from './App'
import { ThemeProvider } from '@material-ui/styles'

class ThemedApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lightTheme: props.lightTheme,
      darkTheme: props.darkTheme,
      useDarkTheme: props.useDarkTheme
    }
    window.appRef = this
    window.setDarkTheme = this.setUseDarkTheme.bind(this)
  }

  setUseDarkTheme(dark) {
    console.log('Use dark theme: ' + dark)
    const { useDarkTheme } = window.appRef.state
    window.dark_theme = dark
    window.appRef.setState({useDarkTheme: dark})
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
          <App/>
        </ThemeProvider>
      </div>
    )
  }
}

export default ThemedApp