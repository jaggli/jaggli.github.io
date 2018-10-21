import { aspectSizes } from './lib'
import { AppBar, Plane, Pipe, Sprite, Coin } from './constructors'

import * as imageSources from './images'
import * as soundSources from './sounds'
import * as fontSources from './fonts'

const STATE_READY = 'ready'
const STATE_RUNNING = 'running'
const STATE_CRASHED = 'crashed'

const PLANE_UP = 'up'
const PLANE_DOWN = 'down'

const aspectRatio = 0.7
const frameRate = 60

const sketch = p5 => {
  const elements = {
    points: 0,
    coins: [],
    fonts: {},
    images: {},
    pipes: [],
    plane: null,
    appBar: null,
    sounds: {},
    sprites: []
  }

  let state = null
  const crash = () => {
    if (state !== STATE_RUNNING) { return }
    state = STATE_CRASHED
    elements.sounds.crash.play()
    elements.sounds.menu.loop()
    elements.sounds.game.stop()
    elements.plane.freeze()
    elements.pipes.forEach(pipe => pipe.freeze())
    elements.coins.forEach(coin => coin.freeze())
    elements.sprites.forEach(sprite => sprite.freeze())
  }

  const start = () => {
    if (state !== STATE_READY) { return }
    state = STATE_RUNNING
    elements.sounds.menu.stop()
    elements.sounds.game.loop()
    elements.plane.unfreeze()
    elements.pipes.forEach(pipe => pipe.unfreeze())
    elements.coins.forEach(coin => coin.unfreeze())
    elements.sprites.forEach(sprite => sprite.unfreeze())
  }

  p5.preload = () => {
    Object.keys(imageSources).forEach(key => {
      elements.images[key] = p5.loadImage(imageSources[key])
    })
    Object.keys(soundSources).forEach(key => {
      elements.sounds[key] = p5.loadSound(soundSources[key])
    })
    Object.keys(fontSources).forEach(key => {
      elements.fonts[key] = p5.loadFont(fontSources[key])
    })
  }

  const reset = () => {
    const { images, fonts } = elements
    elements.plane = new Plane(p5, [images.plane0, images.plane1])
    elements.appBar = new AppBar(p5, fonts.menu)
    elements.pipes = []
    elements.coins = []
    elements.sprites = [
      new Sprite(p5, images.mountainsVeryFar, 1, 'bottom'),
      new Sprite(p5, images.mountainsFar, 1.5, 'bottom'),
      new Sprite(p5, images.mountains, 3, 'bottom'),
      new Sprite(p5, images.cloudSmall, 2.5, 0.2),
      new Sprite(p5, images.cloudMedium, 4, 0.1)
    ]
    elements.points = 0
    state = STATE_READY
  }

  p5.setup = () => {
    p5.createCanvas(...aspectSizes(p5, aspectRatio))
    p5.frameRate(frameRate)
    elements.sounds.menu.loop()
    reset()
  }

  p5.draw = () => {
    const { appBar, plane, pipes, sprites, coins, images, sounds } = elements
    const planeCollisionArea = plane.getCollisionArea()

    p5.background(196, 218, 231)

    sprites.forEach(sprite => sprite.draw())

    const obstacleFrame = Math.round(10 * 1000 / frameRate)
    if (state === STATE_RUNNING && p5.frameCount % obstacleFrame === 0) {
      pipes.unshift(new Pipe(p5, 5))
    }
    if (
      state === STATE_RUNNING &&
      p5.frameCount % obstacleFrame === Math.round(obstacleFrame / 2)
    ) {
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
        sounds.coin.play()
        elements.points += 1
        coins.splice(i, 1)
      }
      if (coin.isOffscreen()) {
        coins.splice(i, 1)
      }
    })

    let hint = ''
    if (state === STATE_READY) {
      hint = 'Hold space/mouse/touch for trottle'
    }
    if (state === STATE_CRASHED) {
      hint = 'Game over\nPress space/mouse/touch'
    }

    appBar.draw(elements.points, hint)
    if (appBar.intersects(planeCollisionArea)) {
      crash()
    }

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

  p5.touchStarted = () => action(PLANE_UP)
  p5.mousePressed = ({ button }) => button === 0
    ? action(PLANE_UP)
    : null
  p5.keyPressed = ({ code }) => code === 'Space'
    ? action(PLANE_UP)
    : null
  p5.touchEnded = () => action(PLANE_DOWN)
  p5.mouseReleased = ({ button }) => button === 0 && state === STATE_RUNNING
    ? action(PLANE_DOWN)
    : null
  p5.keyReleased = ({ code }) => code === 'Space' && state === STATE_RUNNING
    ? action(PLANE_DOWN)
    : null

  p5.windowResized = () => {
    p5.resizeCanvas(...aspectSizes(p5, aspectRatio))
    p5.background(0, 0, 0)
  }
}

export default sketch
