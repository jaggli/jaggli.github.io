import styled from 'styled-components'

const Flag = styled.div`
  position: absolute;
  bottom: -11px;
  height:100px;
  width:100px;
  overflow:hidden;
  z-index:-1;
  box-shadow:0 2px #849092;
  &:after,
  &:before{
    content:"";
    position:absolute;
    width:95%;
    height:0;
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

export default Flag
