# airplane

add this to your application

```js
const url = 'https://www.jaggli.com/airplane/'
const sequence = []
const lulz = '1,1,3,3,0,2,0,2,29,28'
const listener = event => {
  sequence.push(event.keyCode - 37)
  if (sequence.toString().indexOf(lulz) < 0) { return }
  document.removeEventListener('keydown', listener)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('src', url)
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('scrolling', 'no')
  const css = `
    z-index: 9999;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
  `
  iframe.style.cssText = css
  document.body.style.cssText = css
  document.body.innerHTML = ''
  document.body.appendChild(iframe)
}
document.addEventListener('keydown', listener)
```