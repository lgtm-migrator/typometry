import { createMuiTheme } from '@material-ui/core'

const typometryThemeDark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#2A2A2A',
      background: '#1a1a1a'
    },
    primaryPaper: {
      primary: {
        main: '#404040'
      }
    },
    secondaryPaper: {
      primary: {
        main: '#333'
      }
    },
    popper: {
      primary: {
        main: '#474747'
      }
    }
  }
})

export default typometryThemeDark
