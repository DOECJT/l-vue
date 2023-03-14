interface Effect {
  (...args: unknown[]): unknown
}
interface EffectFn {
  (...args: unknown[]): unknown
  deps: EffectStore[]
}

const effectStack: EffectFn[] = []
let activeEffect: EffectFn | undefined
type EffectStore = Set<EffectFn>
type PropStore = Map<PropertyKey, EffectStore>
const bucket = new WeakMap<object, PropStore>()

function track<T extends Record<PropertyKey, any>>(target: T, key: PropertyKey) {
  if (!activeEffect)
    return

  let propStore = bucket.get(target)
  if (!propStore)
    bucket.set(target, propStore = new Map())

  let effectStore = propStore.get(key)
  if (!effectStore)
    propStore.set(key, effectStore = new Set())

  effectStore.add(activeEffect)
  propStore.set(key, effectStore)
  activeEffect.deps.push(effectStore)
}

function trigger<T extends Record<PropertyKey, any>>(target: T, key: PropertyKey) {
  const propStore = bucket.get(target)
  if (!propStore)
    return

  const effectStore = propStore.get(key)
  if (!effectStore)
    return

  const runStore: EffectStore = new Set()
  effectStore.forEach((effectFn) => {
    if (effectFn === activeEffect)
      return

    runStore.add(effectFn)
  })

  runStore.forEach(effectFn => effectFn())
}

export function observe<T extends Record<PropertyKey, any>>(data: T) {
  return new Proxy(data, {
    get(target, key) {
      track(target, key)

      return target[key]
    },
    set(target, key, newValue) {
      (target as Record<PropertyKey, any>)[key] = newValue

      trigger(target, key)

      return true
    },
  })
}

function cleanup(effectFn: EffectFn) {
  effectFn.deps.forEach(effectStore => effectStore.delete(effectFn))
  effectFn.deps = []
}
export function effect(fn: Effect) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)

    effectStack.push(effectFn)
    activeEffect = effectStack[effectStack.length - 1]

    fn()

    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.deps = []

  effectFn()
}
