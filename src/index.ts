interface Effect {
  (...args: unknown[]): unknown
}
interface EffectFn {
  (...args: unknown[]): unknown
  deps: EffectStore[]
}

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
  effectStore.forEach(effect => runStore.add(effect))

  runStore.forEach(effect => effect())
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

export function effect(fn: Effect) {
  const effectFn: EffectFn = () => {
    effectFn.deps.forEach(effectStore => effectStore.clear())
    effectFn.deps = []

    activeEffect = effectFn

    fn()
  }

  effectFn.deps = []

  effectFn()
}
