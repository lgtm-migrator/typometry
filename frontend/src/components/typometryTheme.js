import { createMuiTheme } from '@material-ui/core'

const typometryTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#cfd8dc',
      background: '#fff',
      contrastText: '#000'
    },
    primaryPaper: {
      primary: {
        main: '#fff',
      }
    },
    secondaryPaper: {
      primary: {
        main: '#eceff1',
      }
    },
    popper: {
      primary: {
        main: '#fff',
      }
    }
  }
})

export default typometryTheme
