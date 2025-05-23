const intersectRectRect = (r1, r2) => (
  r1.x + r1.width >= r2.x &&
  r1.x <= r2.x + r2.width &&
  r1.y + r1.height >= r2.y &&
  r1.y <= r2.y + r2.height
)

export default intersectRectRect
