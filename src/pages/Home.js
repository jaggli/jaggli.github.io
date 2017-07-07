import React, { PureComponent } from 'react'
import styled from 'styled-components'
import 'particles.js'

import { Ribbon } from './components'

const Container = styled.div`
  max-width: 990px;
  margin: 40px auto;
`

// const colorPallete = [
//   '75b6b6',
//   'fbeed0',
//   '4b4d4e',
//   '947d76',
//   'a3bcb2',
//   '6b9ec2'
// ]

const Content = styled.div`
  box-shadow:0 2px 0 #4b4d4e;
  background:
    linear-gradient(to bottom, rgba(75,77,78, 0.2), rgba(75,77,78, 0.1) 5px),
    linear-gradient(to right, #fff, #fff)
    ;
  margin:60px 30px;
  box-shadow:  0 2px #849092;
  border-radius:2px;
  position:relative;
  padding:20px;
  canvas{
    height:600px !important;
    cursor:pointer;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
`

class Home extends PureComponent {
  render = () => (
    <div>
      <Container>
        <Ribbon>jaggli.com</Ribbon>
      </Container>
      <Container>
        <Content id='particles' />          
      </Container>    
    </div>
  )

  componentDidMount = () => {
    global.particlesJS('particles', {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#4b4d4e"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#4b4d4e",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 6,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 200,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 155.84415584415586,
        "size": 211.78821178821178,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 111.8881118881119,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
})
  }
}


export default Home