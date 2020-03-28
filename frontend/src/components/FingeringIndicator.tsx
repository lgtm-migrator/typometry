import * as React from 'react'
import './FingeringIndicator.css'
import FingeringText from './FingeringText'
import { Fade, Theme } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'


interface FingeringIndicatorProps {
  showWord: boolean
  fingeringObject: any
}

const FingeringIndicator: React.FC<FingeringIndicatorProps> = (props) => {
  const theme: Theme = useTheme()
  const darkTheme = theme.palette.type === 'dark'
  return (
    <Fade in>
      <div className='hands-container'>
        <div className={darkTheme ? 'hands-dark' : 'hands'}>
          {
            props.showWord ?
              <FingeringText fingeringObject={props.fingeringObject} />
              :
              ''
          }
          {
            props.fingeringObject.fingerSet.map((finger, index) => (
              <div key={index} className={'finger f' + finger + (darkTheme ? ' finger-dark' : '')} />
            ))
          }
        </div>
      </div>
    </Fade>
  )
}

export default FingeringIndicator
