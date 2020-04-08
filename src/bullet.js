import util from './utils/util'

/**
 * [Bullet 弹幕构造类]
 * @type {Class}
 */
class Bullet {
  constructor (danmu, options) {
    this.danmu = danmu
    this.options = options
    this.duration = options.duration
    this.moveV = options.moveV
    this.id = options.id
    this.container = danmu.container
    this.start = options.start
    this.prior = options.prior
    this.color = options.color
    this.bookChannelId = options.bookChannelId
    this.direction = danmu.direction
    let self = this
    this.danmu.on('changeDirection', direction => {
      self.direction = direction
    })
    let el
    this.domObj = util.domObj
    if(options.el && options.el.nodeType === 1) {
      el = this.domObj.use()
      el.appendChild(util.copyDom(options.el))
      // el = util.copyDom(options.el)
    } else {
      el = this.domObj.use()
      // el = document.createElement('div')
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
    if (options.like && options.like.el) {
      this.setLikeDom(options.like.el, options.like.style)
    }
    this.status = 'waiting'// waiting,start,end
    let containerPos = this.container.getBoundingClientRect()
    var random = Math.floor(Math.random() * ((containerPos.width / 10) > 100 ? 200 : containerPos.width / 10));
    if (options.realTime) {
      random = 0
    }
    this.el.style.left = containerPos.width + random + 'px';
  }
  attach () {
    let self = this
    self.container.appendChild(self.el)
    self.elPos = self.el.getBoundingClientRect()
    if(self.direction === 'b2t') {
      self.width = self.elPos.height
      self.height = self.elPos.width
    } else {
      self.width = self.elPos.width
      self.height = self.elPos.height
    }
    if(self.moveV) {
      let containerPos = self.container.getBoundingClientRect()
      self.duration = (containerPos.width + self.width) / self.moveV * 1000
    }
    if (self.danmu.config.mouseControl) {
      self.el.addEventListener('mouseover', self.mouseoverFun.bind(self))
    } 
  }
  mouseoverFun (event) {
    let self = this
    if ((self.danmu.mouseControl && self.danmu.config.mouseControlPause) || self.status === 'waiting' || self.status === 'end') {
      return
    } 
    self.danmu.emit('bullet_hover', {
      bullet: self,
      event: event
    })
  }
  detach () {
    let self = this
    if(self.container && self.el) {
      self.domObj.unuse(self.el)
    }
    self.danmu.off('changeDirection', direction => {
      self.direction = direction
    })
  }
  topInit () {
    if(this.direction === 'b2t') {
      let containerPos = this.container.getBoundingClientRect()
      this.el.style.transformOrigin = 'left top'
      this.el.style.transform = `translateX(-${this.top}px) translateY(${containerPos.height}px) translateZ(0px) rotate(90deg)`;
      this.el.style.transition = `transform 0s linear 0s`
    } else {
      this.el.style.top = `${this.top}px`
    }
  }
  pauseMove (containerPos, isFullscreen = false) {
    // console.log('pauseMove')
    let self = this
    if(this.status === 'paused') {
      return
    }
    if (self.status !== 'forcedPause') {
      this.status = 'paused'
    }
    clearTimeout(self.removeTimer)
    if (!this.el) {
      return
    }
    this.el.style.willChange = 'auto'
    if(this.mode === 'scroll') {
      if(isFullscreen) {
        let pastDuration = (new Date().getTime() - self.moveTime) / 1000
        let pastS = pastDuration * this.moveV
        let ratio = 0
        let nowS = 0
        // console.log('self.moveMoreS: ' + self.moveMoreS)
        // console.log('pastS: ' + pastS)
        if(self.moveMoreS - pastS >= 0) {
          if(this.direction === 'b2t') {
            ratio = (self.moveMoreS - pastS) / self.moveContainerHeight
            nowS = ratio * containerPos.height
          } else {
            ratio = (self.moveMoreS - pastS) / self.moveContainerWidth
            nowS = ratio * containerPos.width
          }
        } else {
          nowS = self.moveMoreS - pastS
        }
        // console.log('nowS: ' + nowS)
        if(this.direction === 'b2t') {
          this.el.style.transform = `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
        } else {
          this.el.style.left = `${nowS}px`
        }
      } else {
        if(this.direction === 'b2t') {
          this.el.style.transform = `translateX(-${this.top}px) translateY(${this.el.getBoundingClientRect().top - containerPos.top}px) translateZ(0px) rotate(90deg)`
        } else {
          this.el.style.left = `${this.el.getBoundingClientRect().left - containerPos.left}px`
        }
      }
      if(this.direction === 'b2t') {
        // this.el.style.transform = `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
        this.el.style.transition = 'transform 0s linear 0s'
      } else {
        this.el.style.transform = 'translateX(0px) translateY(0px) translateZ(0px)'
        this.el.style.transition = 'transform 0s linear 0s'
      }
    } else {
      if(!this.pastDuration || !this.startTime) {
        this.pastDuration = 1
      } else {
        this.pastDuration = this.pastDuration + new Date().getTime() - this.startTime
      }
    }
  }
  startMove (containerPos, force) {
    let self = this
    if (!self.hasMove) {
      self.danmu.emit('bullet_start', self)
      self.hasMove = true
    }
    if (self.status === 'forcedPause' && !force) {
      return
    }
    if (!this.el) return
    if(this.status === 'start') return
    this.status = 'start'
    this.el.style.willChange = 'transform'
    function func () {
      if (self.el) {
        if(self.mode === 'scroll') {
          let containerPos_ = self.danmu.container.getBoundingClientRect()
          let bulletPos = self.el.getBoundingClientRect()
          if(self.direction === 'b2t') {
            if (bulletPos && bulletPos.bottom <= containerPos_.top + 100) {
              self.status = 'end'
              self.remove()
            } else {
              self.pauseMove(containerPos_)
              if (self.danmu.bulletBtn.main.status !== 'paused') {
                self.startMove(containerPos_)
              }
            }
          } else {
            if (bulletPos && bulletPos.right <= containerPos_.left + 100) {
              self.status = 'end'
              self.remove()
            } else {
              self.pauseMove(containerPos_)
              if (self.danmu.bulletBtn.main.status !== 'paused') {
                self.startMove(containerPos_)
              }
            }
          }
        } else {
          self.status = 'end'
          self.remove()
        }
      }
    }
    if(this.mode === 'scroll') {
      if(this.direction === 'b2t') {
        this.moveV = (containerPos.height + this.height) / this.duration * 1000
        let leftDuration = (self.el.getBoundingClientRect().bottom - containerPos.top) / this.moveV
        this.el.style.transition = `transform ${leftDuration}s linear 0s`
        setTimeout(function () {
          if (self.el) {
            self.el.style.transform = `translateX(-${self.top}px) translateY(-${self.height}px) translateZ(0px) rotate(90deg)`
            self.moveTime = new Date().getTime()
            self.moveMoreS = self.el.getBoundingClientRect().top - containerPos.top
            self.moveContainerHeight = containerPos.height
            self.removeTimer = setTimeout(func, leftDuration * 1000)
          }
        }, 20)
      } else {
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
      }
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
      self.el.style.willChange = 'auto'
      this.danmu.off('changeDirection', direction => {
        self.direction = direction
      })
      // self.el.removeEventListener('mouseover', self.mouseoverFun.bind(self))
      this.domObj.unuse(self.el)
      let parent = self.el.parentNode
      parent.removeChild(self.el)
      self.el = null
      self.danmu.emit('bullet_remove', {
        bullet: self
      })
    }
  }
  setFontSize (size) {
    if (this.el) {
      this.el.style[ 'fontSize' ] = size
    }
  }
  setLikeDom (el, style) {
    if (el) {
      Object.keys(style).forEach(function (key) {
        el.style[key] = style[key]
      })
      let likeClass = 'danmu-like'
      el.className = likeClass
      if (this.el) {
        let children = this.el.querySelector('.' + likeClass)
        if (children) {
          this.el.removeChild(children)
        }
        this.el.innerHTML = `${this.el.innerHTML}${el.outerHTML}`
      }
    }
    return el
  }
}

export default Bullet
