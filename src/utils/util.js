export function createDom(el = 'div', tpl = '', attrs = {}, cname = '') {
  let dom = document.createElement(el)
  dom.className = cname
  dom.innerHTML = tpl
  Object.keys(attrs).forEach((item) => {
    let key = item
    let value = attrs[item]
    if (el === 'video' || el === 'audio') {
      if (value) {
        dom.setAttribute(key, value)
      }
    } else {
      dom.setAttribute(key, value)
    }
  })
  return dom
}

export function hasClass(el, className) {
  if (el.classList) {
    return Array.prototype.some.call(el.classList, (item) => item === className)
  } else {
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
  }
}

export function addClass(el, className) {
  if (el.classList) {
    className
      .replace(/(^\s+|\s+$)/g, '')
      .split(/\s+/g)
      .forEach((item) => {
        item && el.classList.add(item)
      })
  } else if (!hasClass(el, className)) {
    el.className += ' ' + className
  }
}

export function removeClass(el, className) {
  if (el.classList) {
    className.split(/\s+/g).forEach((item) => {
      el.classList.remove(item)
    })
  } else if (hasClass(el, className)) {
    className.split(/\s+/g).forEach((item) => {
      let reg = new RegExp('(\\s|^)' + item + '(\\s|$)')
      el.className = el.className.replace(reg, ' ')
    })
  }
}

export function toggleClass(el, className) {
  className.split(/\s+/g).forEach((item) => {
    if (hasClass(el, item)) {
      removeClass(el, item)
    } else {
      addClass(el, item)
    }
  })
}

export function findDom(el = document, sel) {
  let dom
  // fix querySelector IDs that start with a digit
  // https://stackoverflow.com/questions/37270787/uncaught-syntaxerror-failed-to-execute-queryselector-on-document
  try {
    dom = el.querySelector(sel)
  } catch (e) {
    if (sel.startsWith('#')) {
      dom = el.getElementById(sel.slice(1))
    }
  }
  return dom
}

export function deepCopy(dst, src) {
  if (typeOf(src) === 'Object' && typeOf(dst) === 'Object') {
    Object.keys(src).forEach((key) => {
      if (typeOf(src[key]) === 'Object' && !(src[key] instanceof Node)) {
        if (!dst[key]) {
          dst[key] = src[key]
        } else {
          deepCopy(dst[key], src[key])
        }
      } else if (typeOf(src[key]) === 'Array') {
        dst[key] = typeOf(dst[key]) === 'Array' ? dst[key].concat(src[key]) : src[key]
      } else {
        dst[key] = src[key]
      }
    })
    return dst
  }
}

export function typeOf(obj) {
  return Object.prototype.toString.call(obj).match(/([^\s.*]+)(?=]$)/g)[0]
}

export function copyDom(dom) {
  if (dom && dom.nodeType === 1) {
    let back = document.createElement(dom.tagName)
    Array.prototype.forEach.call(dom.attributes, (node) => {
      back.setAttribute(node.name, node.value)
    })
    if (dom.innerHTML) {
      back.innerHTML = dom.innerHTML
    }
    return back
  } else {
    return ''
  }
}

export function formatTime(time) {
  let s = Math.floor(time)
  let ms = time - s
  return s * 1000 + ms
}

function offInDestroy(object, event, fn, offEvent) {
  function onDestroy() {
    object.off(event, fn)
    object.off(offEvent, onDestroy)
  }
  object.once(offEvent, onDestroy)
}

export function attachEventListener(object, event, fn, offEvent) {
  if (offEvent) {
    object.on(event, fn)
    offInDestroy(object, event, fn, offEvent)
  } else {
    let _fn = (data) => {
      fn(data)
      object.off(event, _fn)
    }
    object.on(event, _fn)
  }
}

/**
 * @param {HTMLElement} elem 
 * @param {string} name 
 * @param {string} value 
 */
export function styleUtil(elem, name, value) {
  let style = elem.style
  try {
    style[name] = value
  } catch (error) {
    style.setProperty(name, value)
  }
}

export function isNumber(val) {
  return typeof val === 'number' && !isNaN(val)
}
