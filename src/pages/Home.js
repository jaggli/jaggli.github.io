import React from 'react'
import styled from 'styled-components'
import 'particles.js'

import { Ribbon } from './components'

const Container = styled.div`
  max-width: 990px;
  margin: 40px auto;
`

const Home = () => (
  <div>
    <Container>
      <Ribbon>www.jaggli.com</Ribbon>
    </Container>
  </div>
)

export default Home
