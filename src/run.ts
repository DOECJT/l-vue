import { effect, observe } from './index.js'

const root = document.querySelector('#app')

const data = {
  foo: 1,
}
const obj = observe(data)

effect(() => {
  obj.foo++
})

export {}
