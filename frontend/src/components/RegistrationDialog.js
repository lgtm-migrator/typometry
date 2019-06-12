import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button, makeStyles
} from '@material-ui/core'
import ReactGA from 'react-ga'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import axios from 'axios'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  formField: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  },
  submit: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1)
  },
  extraErrors: {
    fontSize: '0.75em',
    color: '#f00',
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(1)
  }
}))

function RegistrationForm() {
  const classes = useStyles()
  const [status, setStatus] = React.useState('idle')
  const [values, setValues] = React.useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  })
  const [errors, setErrors] = React.useState({
    username: null,
    email: null,
    password1: null,
    password2: null
  })
  const endpoint = '/rest-auth/registration/'

  function submitForm() {
    setStatus('loading')
    axios.post(endpoint, values)
      .then(res => {
        console.log(res)
        window.location.reload()
      })
      .catch(error => {
        setErrors(error.response.data)
        console.log(error.response.data)
      })
  }

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value })
  }

  function captureEnter() {
    if (window.event.keyCode === 13) {
      submitForm()
    }
  }

  return (
    <form className={classes.container} onKeyDown={captureEnter}>
      <Grid container justify='center' direction='column' spacing={1}>
        <Grid item>
          <TextField
            id='username'
            label='Username'
            className={classes.formField}
            value={values.username}
            helperText={errors.username}
            error={Boolean(errors.username)}
            onChange={handleChange('username')}
            variant='outlined' />
        </Grid>
        <Grid item>
          <TextField
            id='email'
            label='E-mail address'
            className={classes.formField}
            value={values.email}
            helperText={errors.email}
            error={Boolean(errors.email)}
            onChange={handleChange('email')}
            variant='outlined' />
        </Grid>
        <Grid item>
          <TextField
            id='password1'
            label='Password'
            type='password'
            className={classes.formField}
            value={values.password1}
            helperText={errors.password1}
            error={Boolean(errors.password1)}
            onChange={handleChange('password1')}
            variant='outlined' />
        </Grid>
        <Grid item>
          <TextField
            id='password2'
            label='Repeat password'
            type='password'
            className={classes.formField}
            value={values.password2}
            onChange={handleChange('password2')}
            helperText={errors.password2}
            error={Boolean(errors.password2)}
            variant='outlined' />
        </Grid>
        <Grid item>
          <Button className={classes.submit} variant='contained' color='primary' onClick={submitForm}>Submit</Button>
          { Boolean(errors.non_field_errors) ?
            <div>
              <br/>
              <Typography className={classes.extraErrors}>
                {errors.non_field_errors}
              </Typography>
            </div>
            :
            ''
          }
        </Grid>
      </Grid>
    </form>
  )
}

function RegistrationDialog(props) {
  const { open, handleClose } = props

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id='registration-dialog-title'>Register</DialogTitle>
      <DialogContent>
        <RegistrationForm />
      </DialogContent>
    </Dialog>
  )
}

export default RegistrationDialog
