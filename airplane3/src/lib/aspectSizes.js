const aspectSizes = (p5, aspectRatio) => {
  let { windowWidth: width, windowHeight: height } = p5
  const ratio = width / height
  return [
    ratio > aspectRatio ? Math.floor(height * aspectRatio) : width,
    ratio < aspectRatio ? Math.floor(width / aspectRatio) : height
  ]
}

export default aspectSizes
