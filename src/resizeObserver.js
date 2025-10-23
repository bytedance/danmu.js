import { throttle } from './utils/util'

class ResizeObserver {
  constructor() {
    this.__handlers = []
    if (typeof window === 'undefined' || !window.ResizeObserver) {
      return
    }
    try {
      this.observer = new ResizeObserver(
        throttle((entries) => {
          this.__trigger(entries)
        }, 100)
      )
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  addObserver(target, handler) {
    if (!this.observer || !target) {
      return
    }
    this.observer && this.observer.observe(target)
    const { __handlers } = this
    let index = -1
    for (let i = 0; i < __handlers.length; i++) {
      if (__handlers[i] && target === __handlers[i].target) {
        index = i
      }
    }
    if (index > -1) {
      this.__handlers[index].handler.push(handler)
    } else {
      this.__handlers.push({
        target,
        handler: [handler]
      })
    }
  }

  unObserver(target) {
    if (!target) {
      return
    }
    let i = -1
    this.__handlers.map((item, index) => {
      if (target === item.target) {
        i = index
      }
    })
    this.observer && this.observer.unobserve(target)
    i > -1 && this.__handlers.splice(i, 1)
  }

  destroyObserver() {
    this.observer && this.observer.disconnect()
    this.observer = null
    this.__handlers = null
  }

  __runHandler(target) {
    const { __handlers } = this
    for (let i = 0; i < __handlers.length; i++) {
      if (__handlers[i] && target === __handlers[i].target) {
        __handlers[i].handler &&
          __handlers[i].handler.map((handler) => {
            try {
              handler()
            } catch (error) {
              console.error(error)
            }
          })
        break
      }
    }
  }

  __trigger(entries) {
    entries.map((item) => {
      this.__runHandler(item.target)
    })
  }
}

const resizeObserver = new ResizeObserver()

function addObserver(target, handler) {
  resizeObserver.addObserver(target, handler)
}

function unObserver(target, handler) {
  resizeObserver.unObserver(target, handler)
}

function destroyObserver(target, handler) {
  resizeObserver.destroyObserver(target, handler)
}

export { addObserver, unObserver, destroyObserver }
