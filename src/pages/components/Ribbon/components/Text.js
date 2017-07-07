import styled from 'styled-components'

const Text = styled.div`
  font-family: "Six Caps", sans-serif;
  font-size:70px;
  background:#fbeed0;
  text-align: center;
  box-shadow:0 0 2px grey, 0 2px #849092;
  height:100px;
  text-transform:uppercase;
  text-shadow:2px 2px 0 #fbeed0, 3px 3px 0 black;
  &:after,
  &:before{
    content:"";
    position:absolute;
    width:100%;
    height:0;
    left:0;
    border: 1px dashed #849092;
    opacity:0.5;
  }
  &:after{
    top:3px;
  }
  &:before{
    bottom:3px;
  }
`

export default Text
