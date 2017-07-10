import React from 'react'
import styled from 'styled-components'
import { Flag, Text } from './components'

const Container = styled.h1`
  position:relative;
  margin:0 80px;
  font-weight:normal;
  &:after,
  &:before{
    content:"";
    position:absolute;
    width:0;
    height:0;
    border:solid transparent;
  }
  &:before{
    left:-3px;
    bottom:-12px;
    border-width:12px 0 0 24px;
    border-top-color: #849092;
  }
  &:after{
    right:-3px;
    bottom:-12px;
    border-width:12px 24px 0 0;
    border-top-color: #849092;
  }
`

const LeftFlag = Flag.extend`
  left:-80px;
  background:
    linear-gradient(to top right, transparent 50%, #fbeed0 50%),
    linear-gradient(to bottom right, transparent 50%, #fbeed0 50%)
    ;
  &:after,
  &:before{
    right:0;
  }
`
const RightFlag = Flag.extend`
  right:-80px;
  background:
    linear-gradient(to top left, transparent 50%, #fbeed0 50%),
    linear-gradient(to bottom left, transparent 50%, #fbeed0 50%)
    ;
  &:after,
  &:before{
    left:0;
  }
`

const Ribbon = ({children, ...props}) => (
  <Container {...props}>
    <LeftFlag />
    <RightFlag />
    <Text>{children}</Text>
  </Container>
)

export default Ribbon
