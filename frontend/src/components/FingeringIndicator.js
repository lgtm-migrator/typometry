import React from 'react'
import './FingeringIndicator.css'
import FingeringText from './FingeringText'
import { Fade } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'


function FingeringIndicator(props) {
  const theme = useTheme()
  const darkTheme = theme.palette.type === 'dark'
  return (
    <Fade in>
      <div className='hands-container'>
        <div className={darkTheme ? 'hands-dark' : 'hands'}>
          { props.showWord ?
            <FingeringText {...props} />
            :
            ''
          }
          { props.fingeringObject.fingerSet.map((finger, index) => (
            <div key={index} className={'finger f' + finger + (darkTheme ? ' finger-dark' : '')} />
          )) }
        </div>
      </div>
    </Fade>
  )
}

export default FingeringIndicator
