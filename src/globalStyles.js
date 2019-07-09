import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
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

export default GlobalStyles
