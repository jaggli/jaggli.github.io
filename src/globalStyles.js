import { injectGlobal, css } from 'styled-components'

const globalStyles = css`
  body{    
    color:#4b4d4e;
    min-width:320px;
    background: #75b6b6;
    font-family: "Open Sans", sans-serif;
    *, *:after, *:before{
      box-sizing: border-box;
    }

  }
`

injectGlobal([globalStyles])
export default globalStyles