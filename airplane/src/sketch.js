import { aspectSizes } from './lib'
import { Plane, Pipe, Sprite } from './constructors'

import plane0 from './images/plane-0.png'
import plane1 from './images/plane-1.png'
import mountainsVeryFar from './images/mountains-very-far.png'
import mountainsFar from './images/mountains-far.png'
import mountains from './images/mountains-near.png'
import cloudMedium from './images/cloud-medium.png'
import cloudSmall from './images/cloud-small.png'

const STATE_READY = 'ready'
const STATE_RUNNING = 'running'
const STATE_CRASHED = 'crashed'

const PLANE_UP = 'up'
const PLANE_DOWN = 'down'

const aspectRatio = 0.7

const sketch = p5 => {
  const elements = {
    plane: null,
    pipes: [],
    sprites: [],
    images: {}
  }

  let state = null
  const crash = () => {
    if (state !== STATE_RUNNING) { return }
    state = STATE_CRASHED
    elements.plane.freeze()
    elements.pipes.forEach(pipe => pipe.freeze())
    elements.sprites.forEach(sprite => sprite.freeze())
  }

  const start = () => {
    if (state !== STATE_READY) { return }
    state = STATE_RUNNING
    elements.plane.unfreeze()
    elements.pipes.forEach(pipe => pipe.unfreeze())
    elements.sprites.forEach(sprite => sprite.unfreeze())
  }

  p5.preload = () => {
    elements.images.plane = [
      p5.loadImage(plane0),
      p5.loadImage(plane1)
    ]
    elements.images.mountainsVeryFar = p5.loadImage(mountainsVeryFar)
    elements.images.mountainsFar = p5.loadImage(mountainsFar)
    elements.images.mountains = p5.loadImage(mountains)
    elements.images.cloudMedium = p5.loadImage(cloudMedium)
    elements.images.cloudSmall = p5.loadImage(cloudSmall)
  }

  const reset = () => {
    elements.plane.reset()
    elements.pipes = []
    elements.sprites = [
      new Sprite(p5, elements.images.mountainsVeryFar, 2, 'bottom'),
      new Sprite(p5, elements.images.mountainsFar, 3.5, 'bottom'),
      new Sprite(p5, elements.images.mountains, 4, 'bottom'),
      new Sprite(p5, elements.images.cloudSmall, 2.5, p5.random(0, 0.2)),
      new Sprite(p5, elements.images.cloudMedium, 4, p5.random(0, 0.2))
    ]
    state = STATE_READY
  }

  p5.setup = () => {
    p5.createCanvas(...aspectSizes(p5, aspectRatio))
    p5.frameRate(60)
    elements.plane = new Plane(p5, elements.images.plane)
    reset()
  }

  p5.draw = () => {
    const { plane, pipes, sprites } = elements
    p5.background(196, 218, 231)

    sprites.forEach(sprite => sprite.draw())

    if (state === STATE_RUNNING && p5.frameCount % 150 === 0) {
      pipes.unshift(
        new Pipe(p5)
      )
    }

    pipes.forEach((pipe, i) => {
      pipe.draw()
      if (pipe.intersects(plane.getCollisionArea())) {
        return crash()
      }
      if (pipe.isOffscreen()) {
        pipes.splice(i, 1)
      }
    })

    plane.draw()
  }

  const action = (method) => {
    const { plane } = elements
    if (state === STATE_READY) {
      start()
    }
    if (state === STATE_RUNNING) {
      plane[method]()
    }
    if (state === STATE_CRASHED) {
      reset()
    }
  }

  p5.mousePressed = ({ button }) => button === 0
    ? action(PLANE_UP)
    : null
  p5.keyPressed = ({ code }) => code === 'Space'
    ? action(PLANE_UP)
    : null
  p5.mouseReleased = ({ button }) => button === 0
    ? action(PLANE_DOWN)
    : null
  p5.keyReleased = ({ code }) => code === 'Space'
    ? action(PLANE_DOWN)
    : null

  p5.windowResized = () => {
    p5.resizeCanvas(...aspectSizes(p5, aspectRatio))
    p5.background(0, 0, 0)
  }
}

export default sketch
