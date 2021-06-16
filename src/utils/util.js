let util = {}

util.createDom = function (el = 'div', tpl = '', attrs = {}, cname = '') {
  let dom = document.createElement(el)
  dom.className = cname
  dom.innerHTML = tpl
  Object.keys(attrs).forEach(item => {
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

util.hasClass = function (el, className) {
  if (el.classList) {
    return Array.prototype.some.call(el.classList, item => item === className)
  } else {
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
  }
}

util.addClass = function (el, className) {
  if (el.classList) {
    className.replace(/(^\s+|\s+$)/g, '').split(/\s+/g).forEach(item => {
      item && el.classList.add(item)
    })
  } else if (!util.hasClass(el, className)) {
    el.className += ' ' + className
  }
}

util.removeClass = function (el, className) {
  if (el.classList) {
    className.split(/\s+/g).forEach(item => {
      el.classList.remove(item)
    })
  } else if (util.hasClass(el, className)) {
    className.split(/\s+/g).forEach(item => {
      let reg = new RegExp('(\\s|^)' + item + '(\\s|$)')
      el.className = el.className.replace(reg, ' ')
    })
  }
}

util.toggleClass = function (el, className) {
  className.split(/\s+/g).forEach(item => {
    if (util.hasClass(el, item)) {
      util.removeClass(el, item)
    } else {
      util.addClass(el, item)
    }
  })
}

util.findDom = function (el = document, sel) {
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

util.deepCopy = function (dst, src) {
  if (util.typeOf(src) === 'Object' && util.typeOf(dst) === 'Object') {
    Object.keys(src).forEach(key => {
      if (util.typeOf(src[key]) === 'Object' && !(src[key] instanceof Node)) {
        if (!dst[key]) {
          dst[key] = src[key]
        } else {
          util.deepCopy(dst[key], src[key])
        }
      } else if (util.typeOf(src[key]) === 'Array') {
        dst[key] = util.typeOf(dst[key]) === 'Array' ? dst[key].concat(src[key]) : src[key]
      } else {
        dst[key] = src[key]
      }
    })
    return dst
  }
}

util.typeOf = function (obj) {
  return Object.prototype.toString.call(obj).match(/([^\s.*]+)(?=]$)/g)[0]
}

util.copyDom = function (dom) {
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

util.formatTime = function (time) {
  let s = Math.floor(time)
  let ms = time - s
  return s * 1000 + ms
}

util.offInDestroy = (object, event, fn, offEvent) => {
  function onDestroy () {
    object.off(event, fn)
    object.off(offEvent, onDestroy)
  }
  object.once(offEvent, onDestroy)
}

util.on = (object, event, fn, offEvent) => {
  if (offEvent) {
    object.on(event, fn)
    util.offInDestroy(object, event, fn, offEvent)
  } else {
    let _fn = data => {
      fn(data)
      object.off(event, _fn)
    }
    object.on(event, _fn)
  }
}

util.style = (elem, name, value)=>{
  let style = elem.style;
  try {
    style[name] = value;
  } catch (error) {
    style.setProperty( name, value );
  }
}

export default util
