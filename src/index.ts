interface VElement {
  tag: string
  props: { [prop: string]: any }
  children: VNode[] | string
}

interface VComponent {
  tag: () => VElement
}

type VNode = VElement | VComponent

function isElement(vnode: VNode): vnode is VElement {
  return typeof vnode.tag === 'string'
}
function mountElement(vnode: VElement, root: Element | null) {
  const el = document.createElement(vnode.tag)

  // props
  for (const prop in vnode.props) {
    if (prop.startsWith('on')) {
      const eventName = prop.slice(2).toLowerCase()
      const handler = vnode.props[prop]
      el.addEventListener(eventName, handler)
    }
  }

  // children
  if (typeof vnode.children === 'string') {
    const text = document.createTextNode(vnode.children)
    el.appendChild(text)
  }
  else {
    vnode.children.forEach((child) => {
      render(child, el)
    })
  }

  root && root.appendChild(el)
}

function isComponent(vnode: VNode): vnode is VComponent {
  return typeof vnode.tag === 'function'
}
function mountComponent(vnode: VComponent, root: Element | null) {
  const content = vnode.tag()

  render(content, root)
}

function render<T extends VNode>(vnode: T, root: Element | null) {
  if (isElement(vnode))
    mountElement(vnode, root)
  else
    mountComponent(vnode, root)
}

const root = document.querySelector('#app')
const vnode: VNode = {
  tag: 'button',
  props: {
    onClick: () => alert('hello'),
  },
  children: 'click me',
}
const App = (): VElement => ({
  tag: 'div',
  props: {
    onClick: () => {
      console.log('xixi')
    },
  },
  children: 'Hello, world!',
})
const app: VNode = {
  tag: App,
}
// render(vnode, root)
render(app, root)
