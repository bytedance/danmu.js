import util from './utils/util'

/**
 * [Buulet 弹幕构造类]
 * @type {Class}
 */
class Bullet {
  constructor (danmu, options) {
    this.danmu = danmu
    this.duration = options.duration / 1000
    this.id = options.id
    this.container = danmu.container
    this.start = options.start
    this.prior = options.prior
    this.bookChannelId = options.bookChannelId

    let el
    if(options.el && options.el.nodeType === 1) {
      el = util.copyDom(options.el)
    } else {
      el = document.createElement('div')
      el.textContent = options.txt
      if(options.style) {
        let style = options.style
        Object.keys(style).forEach(function (key) {
          el.style[key] = style[key]
        })
      }
    }

    if(options.mode === 'top' || options.mode === 'bottom') {
      this.mode = options.mode
    } else {
      this.mode = 'scroll'
    }

    this.el = el
    this.status = 'waiting'// waiting,start,end
    let containerPos = this.container.getBoundingClientRect()
    this.el.style.left = `${containerPos.width}px`
  }
  attach () {
    this.container.appendChild(this.el)
    this.elPos = this.el.getBoundingClientRect()
    this.width = this.elPos.width
    this.height = this.elPos.height
  }
  detach () {
    if(this.container && this.el) {
      this.container.removeChild(this.el)
    }
    this.el = null
  }
  topInit () {
    this.el.style.top = `${this.top}px`
  }
  pauseMove (containerPos, isFullscreen = false) {
    // console.log('pauseMove')
    let self = this
    if(this.status === 'paused') {
      return
    }
    this.status = 'paused'
    clearTimeout(self.removeTimer)
    if (!this.el) {
      return
    }
    if(this.mode === 'scroll') {
      if(isFullscreen) {
        let pastDuration = (new Date().getTime() - self.moveTime) / 1000
        let pastS = pastDuration * this.moveV
        let nowS = (self.moveMoreS - pastS) / (self.moveContainerWidth + self.width) * (containerPos.width + self.width)
        this.el.style.left = `${nowS - self.width}px`
      } else {
        this.el.style.left = `${this.el.getBoundingClientRect().left - containerPos.left}px`
      }
      this.el.style.transform = 'translateX(0px) translateY(0px) translateZ(0px)'
      this.el.style.transition = 'transform 0s linear 0s'
    }
  }
  startMove (containerPos) {
    // console.log('startMove')
    let self = this
    if (!this.el) {
      return
    }
    if(this.status === 'start') {
      return
    }
    this.status = 'start'
    function func () {
      if (self.el) {
        if(self.mode === 'scroll') {
          let containerPos_ = self.danmu.container.getBoundingClientRect()
          let bulletPos = self.el.getBoundingClientRect()
          if (bulletPos && bulletPos.right <= containerPos_.left) {
            self.status = 'end'
            console.log('1')
            self.remove()
          } else {
            self.pauseMove(containerPos_)
            self.startMove(containerPos_)
          }
        } else {
          self.status = 'end'
          console.log('2')
          self.remove()
        }
      }
    }
    if(this.mode === 'scroll') {
      this.moveV = (containerPos.width + this.width) / this.duration
      let leftDuration = (self.el.getBoundingClientRect().right - containerPos.left) / this.moveV
      this.leftDuration = leftDuration
      this.el.style.transition = `transform ${leftDuration}s linear 0s`
      setTimeout(function () {
        if (self.el) {
          self.el.style.transform = `translateX(-${self.el.getBoundingClientRect().right - containerPos.left}px) translateY(0px) translateZ(0px)`
          self.moveTime = new Date().getTime()
          self.moveMoreS = self.el.getBoundingClientRect().right - containerPos.left
          self.moveContainerWidth = containerPos.width
          self.removeTimer = setTimeout(func, leftDuration * 1000 + 1000)
        }
      }, 20)
    } else {
      // this.el.style.width = `${this.width}px`
      // this.el.style.height = `${this.height}px`
      this.el.style.left = '50%'
      this.el.style.margin = `0 0 0 -${this.width/2}px`
      this.removeTimer = setTimeout(func, self.duration * 1000 + 1000)
    }
  }
  remove () {
    console.log('remove')
    let self = this
    if (this.removeTimer) {
      clearTimeout(this.removeTimer)
    }
    if (self.el && self.el.parentNode) {
      let parent = self.el.parentNode
      parent.removeChild(self.el)
      self.el = null
      self.danmu.emit('bullet_remove', {
        bullet: self
      })
    }
  }
}

export default Bullet
