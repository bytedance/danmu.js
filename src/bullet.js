import util from './utils/util'

/**
 * [Bullet 弹幕构造类]
 * @type {Class}
 */
class Bullet {
  constructor (danmu, options) {
    this.danmu = danmu
    this.duration = options.duration
    this.id = options.id
    this.container = danmu.container
    this.start = options.start
    this.prior = options.prior
    this.color = options.color
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
        let ratio = 0
        let nowS = 0
        // console.log('self.moveMoreS: ' + self.moveMoreS)
        // console.log('pastS: ' + pastS)
        if(self.moveMoreS - pastS >= 0) {
          ratio = (self.moveMoreS - pastS) / self.moveContainerWidth
          nowS = ratio * containerPos.width
        } else {
          nowS = self.moveMoreS - pastS
        }
        // console.log('nowS: ' + nowS)
        this.el.style.left = `${nowS}px`
      } else {
        this.el.style.left = `${this.el.getBoundingClientRect().left - containerPos.left}px`
      }
      this.el.style.transform = 'translateX(0px) translateY(0px) translateZ(0px)'
      this.el.style.transition = 'transform 0s linear 0s'
    } else {
      if(!this.pastDuration || !this.startTime) {
        this.pastDuration = 1
      } else {
        this.pastDuration = this.pastDuration + new Date().getTime() - this.startTime
      }
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
          if (bulletPos && bulletPos.right <= containerPos_.left + 100) {
            self.status = 'end'
            self.remove()
          } else {
            self.pauseMove(containerPos_)
            self.startMove(containerPos_)
          }
        } else {
          self.status = 'end'
          self.remove()
        }
      }
    }
    if(this.mode === 'scroll') {
      this.moveV = (containerPos.width + this.width) / this.duration * 1000
      let leftDuration = (self.el.getBoundingClientRect().right - containerPos.left) / this.moveV
      this.el.style.transition = `transform ${leftDuration}s linear 0s`
      setTimeout(function () {
        if (self.el) {
          self.el.style.transform = `translateX(-${self.el.getBoundingClientRect().right - containerPos.left}px) translateY(0px) translateZ(0px)`
          self.moveTime = new Date().getTime()
          self.moveMoreS = self.el.getBoundingClientRect().left - containerPos.left
          self.moveContainerWidth = containerPos.width
          self.removeTimer = setTimeout(func, leftDuration * 1000)
        }
      }, 20)
    } else {
      // this.el.style.width = `${this.width}px`
      // this.el.style.height = `${this.height}px`
      this.el.style.left = '50%'
      this.el.style.margin = `0 0 0 -${this.width/2}px`
      if(!this.pastDuration) {
        this.pastDuration = 1
      }
      let leftDuration = this.duration >= this.pastDuration ? this.duration - this.pastDuration : 0
      this.removeTimer = setTimeout(func, leftDuration)
      this.startTime = new Date().getTime()
    }
  }
  remove () {
    // console.log('remove')
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
