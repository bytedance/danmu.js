
export default class RecyclableDOMList {
  constructor(options) {
    options = {
      initDOM: () => document.createElement('div'),
      initSize: 10
    }
    this.init(options)
  }

  init(options) {
    this.idleList = []
    this.usingList = []
    this._id = 0
    this.options = options
    this._expand(options.initSize)
  }

  use() {
    if (!this.idleList.length) {
      this._expand(1)
    }
    const firseIdle = this.idleList.shift()
    this.usingList.push(firseIdle)
    return firseIdle
  }

  unuse(dom) {
    const idx = this.usingList.indexOf(dom)
    if (idx < 0) {
      return
    }
    this.usingList.splice(idx, 1)
    dom.innerHTML = ''
    dom.textcontent = ''
    dom.style = ''
    this.idleList.push(dom)
  }

  _expand(size) {
    for (let i = 0; i < size; i++) {
      this.idleList.push(this.options.initDOM(this._id++))
    }
  }

  destroy() {
    for (let i = 0; i < this.idleList.length; i++) {
      this.idleList[i].innerHTML = ''
      this.idleList[i].textcontent = ''
      this.idleList[i].style = ''
    }
    for (let i = 0; i < this.usingList.length; i++) {
      this.usingList[i].innerHTML = ''
      this.usingList[i].textcontent = ''
      this.usingList[i].style = ''
    }
    for (let k in this) {
      delete this[k]
    }
  }
}