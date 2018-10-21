import { aspectSizes } from './lib'
import { Plane, Pipe, Sprite, Coin } from './constructors'

import * as imageSources from './images'

const STATE_READY = 'ready'
const STATE_RUNNING = 'running'
const STATE_CRASHED = 'crashed'

const PLANE_UP = 'up'
const PLANE_DOWN = 'down'

const aspectRatio = 0.7
const frameRate = 60

const sketch = p5 => {
  const elements = {
    plane: null,
    pipes: [],
    coins: [],
    sprites: [],
    images: {}
  }

  let state = null
  const crash = () => {
    if (state !== STATE_RUNNING) { return }
    state = STATE_CRASHED
    elements.plane.freeze()
    elements.pipes.forEach(pipe => pipe.freeze())
    elements.coins.forEach(coin => coin.freeze())
    elements.sprites.forEach(sprite => sprite.freeze())
  }

  const start = () => {
    if (state !== STATE_READY) { return }
    state = STATE_RUNNING
    elements.plane.unfreeze()
    elements.pipes.forEach(pipe => pipe.unfreeze())
    elements.coins.forEach(coin => coin.unfreeze())
    elements.sprites.forEach(sprite => sprite.unfreeze())
  }

  p5.preload = () => {
    Object.keys(imageSources).forEach(key => {
      elements.images[key] = p5.loadImage(imageSources[key])
    })
  }

  const reset = () => {
    elements.plane = new Plane(p5, [elements.images.plane0, elements.images.plane1])
    elements.pipes = []
    elements.coins = []
    elements.sprites = [
      new Sprite(p5, elements.images.mountainsVeryFar, 1, 'bottom'),
      new Sprite(p5, elements.images.mountainsFar, 1.5, 'bottom'),
      new Sprite(p5, elements.images.mountains, 3, 'bottom'),
      new Sprite(p5, elements.images.cloudSmall, 2.5, 0.2),
      new Sprite(p5, elements.images.cloudMedium, 4, 0.1)
    ]
    state = STATE_READY
  }

  p5.setup = () => {
    p5.createCanvas(...aspectSizes(p5, aspectRatio))
    p5.frameRate(frameRate)
    reset()
  }

  p5.draw = () => {
    const { plane, pipes, sprites, coins, images } = elements
    const planeCollisionArea = plane.getCollisionArea()

    p5.background(196, 218, 231)

    sprites.forEach(sprite => sprite.draw())

    const obstacleFrame = 9000 / frameRate
    if (state === STATE_RUNNING && p5.frameCount % obstacleFrame === 0) {
      pipes.unshift(new Pipe(p5, 5))
    }
    if (state === STATE_RUNNING && p5.frameCount % obstacleFrame === 75) {
      coins.unshift(new Coin(p5, images.coin, 5))
    }

    pipes.forEach((pipe, i) => {
      pipe.draw()
      if (pipe.intersects(planeCollisionArea)) {
        return crash()
      }
      if (pipe.isOffscreen()) {
        pipes.splice(i, 1)
      }
    })

    coins.forEach((coin, i) => {
      coin.draw()
      if (coin.intersects(plane.getCollisionArea())) {
        console.log('ding')
        return crash()
      }
      if (coin.isOffscreen()) {
        coins.splice(i, 1)
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
