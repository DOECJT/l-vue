import { effect, observe } from './index.js'

const root = document.querySelector('#app')

const data = {
  ok: true,
  text: 'Hello, world!',
}
const obj = observe(data)

effect(() => {
  console.log('effect fn')
  root && (root.innerHTML = obj.ok ? obj.text : 'empty')
})

// case1 true
// setTimeout(() => {
//   obj.text = 'Hello, Vue!'
// }, 1000)
// case2 false
setTimeout(() => {
  obj.ok = false
  // obj.text = 'Hello, Vue!'
}, 1000)

export {}
