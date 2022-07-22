import BaseClass from './baseClass'
import { copyDom, styleUtil } from './utils/util'

/**
 * [Bullet 弹幕构造类]
 * @type {Class}
 */
class Bullet extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu, options) {
    super()
    this.setLogger('bullet')
    // console.log('Bullet', options)
    // this.logger && this.logger.info('options.moveV', options.moveV)
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
    this.reuseDOM = true
    this.willChanges = []
    let self = this
    let el
    this.domObj = danmu.domObj
    if (options.el && options.el.nodeType === 1) {
      if (options.el.parentNode) return { bulletCreateFail: true }
      if (danmu.config.disableCopyDOM) {
        el = options.el
        this.reuseDOM = false
      } else {
        el = this.domObj.use()
        // console.log(`Create copyDOM with options.el id:${options.id} danmu.config.disableCopyDOM:${danmu.config.disableCopyDOM} !!options.el.parentNode:${!!options.el.parentNode}`)
        let copyDOM = copyDom(options.el)
        if (options.eventListeners && options.eventListeners.length > 0) {
          options.eventListeners.forEach((eventListener) => {
            copyDOM.addEventListener(eventListener.event, eventListener.listener, eventListener.useCapture || false)
          })
        }
        el.appendChild(copyDOM)
      }
      // el = copyDom(options.el)
    } else {
      // console.log(`Create copyDOM with options.txt id:${options.id} `)
      el = this.domObj.use()
      // el = document.createElement('div')
      el.textContent = options.txt
    }
    this.onChangeDirection = (direction) => {
      self.direction = direction
    }
    this.danmu.on('changeDirection', this.onChangeDirection)
    if (options.style) {
      let style = options.style
      Object.keys(style).forEach(function (key) {
        styleUtil(el, key, style[key])
      })
    }
    if (options.mode === 'top' || options.mode === 'bottom') {
      this.mode = options.mode
    } else {
      this.mode = 'scroll'
    }
    this.el = el
    if (options.like && options.like.el) {
      this.setLikeDom(options.like.el, options.like.style)
    }
    this.status = 'waiting' // waiting,start,end
    let containerPos = this.container.getBoundingClientRect()
    let random = Math.floor(Math.random() * (containerPos.width / 10 > 100 ? 200 : containerPos.width / 10))
    if (options.realTime) {
      random = 0
    }
    let left = containerPos.width + random + 'px'
    styleUtil(this.el, 'left', left)
    this.containerPos = containerPos
  }
  attach() {
    // this.logger && this.logger.info(`attach #${this.options.txt || '[DOM Element]'}#`)
    let self = this
    self.container.appendChild(self.el)
    self.elPos = self.el.getBoundingClientRect()
    if (self.direction === 'b2t') {
      self.width = self.elPos.height
      self.height = self.elPos.width
    } else {
      self.width = self.elPos.width
      self.height = self.elPos.height
    }
    if (self.moveV) {
      let containerPos = self.containerPos
      self.duration = ((containerPos.width + self.width) / self.moveV) * 1000
    }
    if (self.danmu.config && self.danmu.config.mouseControl) {
      self.mouseoverFunWrapper = self.mouseoverFun.bind(self)
      self.el.addEventListener('mouseover', self.mouseoverFunWrapper, false)
    }
    if (self.danmu.config && self.danmu.config.mouseEnterControl) {
      self.mouseEnterFunWrapper = self.mouseoverFun.bind(self)
      self.el.addEventListener('mouseenter', self.mouseEnterFunWrapper, false)
    }
  }
  willChange() {
    let val = this.danmu.main.willChanges.concat(this.willChanges).join()
    styleUtil(this.el, 'willChange', val)
  }
  mouseoverFun(event) {
    let self = this
    if (
      (self.danmu && self.danmu.mouseControl && self.danmu.config.mouseControlPause) ||
      self.status === 'waiting' ||
      self.status === 'end'
    ) {
      return
    }
    self.danmu &&
      self.danmu.emit('bullet_hover', {
        bullet: self,
        event: event
      })
  }
  detach() {
    // this.logger && this.logger.info(`detach #${this.options.txt || '[DOM Element]'}#`)
    const self = this
    const el = self.el

    if (el) {
      let config = self.danmu.config
      if (config) {
        if (config.mouseControl) {
          el.removeEventListener('mouseover', self.mouseoverFunWrapper, false)
        }
        if (config.mouseEnterControl) {
          el.removeEventListener('mouseenter', self.mouseEnterFunWrapper, false)
        }
      }
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
      if (self.reuseDOM) {
        self.domObj.unuse(el)
      }
      self.el = null
    }
    this.danmu.off('changeDirection', this.onChangeDirection)
  }
  topInit() {
    this.logger && this.logger.info(`topInit #${this.options.txt || '[DOM Element]'}#`)
    if (this.direction === 'b2t') {
      let containerPos = this.containerPos
      styleUtil(this.el, 'transformOrigin', 'left top')
      styleUtil(
        this.el,
        'transform',
        `translateX(-${this.top}px) translateY(${containerPos.height}px) translateZ(0px) rotate(90deg)`
      )
      styleUtil(this.el, 'transition', 'transform 0s linear 0s')
    } else {
      styleUtil(this.el, 'top', `${this.top}px`)
    }
  }
  pauseMove(containerPos, isFullscreen = false) {
    this.logger && this.logger.info(`pauseMove #${this.options.txt || '[DOM Element]'}#`)
    // console.log('pauseMove')
    let self = this
    if (this.status === 'paused') {
      return
    }
    if (self.status !== 'forcedPause') {
      this.status = 'paused'
    }
    clearTimeout(self.removeTimer)
    if (!this.el) {
      return
    }
    this.willChange()
    if (this.mode === 'scroll') {
      if (isFullscreen) {
        let pastDuration = (new Date().getTime() - self.moveTime) / 1000
        let pastS = pastDuration * this.moveV
        let ratio = 0
        let nowS = 0
        if (self.moveMoreS - pastS >= 0) {
          if (this.direction === 'b2t') {
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
        if (this.direction === 'b2t') {
          styleUtil(
            this.el,
            'transform',
            `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
          )
        } else {
          styleUtil(this.el, 'left', `${nowS}px`)
        }
      } else {
        if (this.direction === 'b2t') {
          styleUtil(
            this.el,
            'transform',
            `translateX(-${this.top}px) translateY(${
              this.el.getBoundingClientRect().top - containerPos.top
            }px) translateZ(0px) rotate(90deg)`
          )
        } else {
          styleUtil(this.el, 'left', `${this.el.getBoundingClientRect().left - containerPos.left}px`)
        }
      }
      if (this.direction === 'b2t') {
        // this.el.style.transform = `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
        styleUtil(this.el, 'transition', 'transform 0s linear 0s')
      } else {
        styleUtil(this.el, 'transform', 'translateX(0px) translateY(0px) translateZ(0px)')
        styleUtil(this.el, 'transition', 'transform 0s linear 0s')
      }
    } else {
      if (!this.pastDuration || !this.startTime) {
        this.pastDuration = 1
      } else {
        this.pastDuration = this.pastDuration + new Date().getTime() - this.startTime
      }
    }
  }
  startMove(containerPos, force) {
    this.logger && this.logger.info(`startMove #${this.options.txt || '[DOM Element]'}#`)
    let self = this
    if (!self.hasMove) {
      self.danmu.emit('bullet_start', self)
      self.hasMove = true
    }
    if (self.status === 'forcedPause' && !force) {
      return
    }
    if (!this.el) return
    if (this.status === 'start') return
    this.status = 'start'

    this.willChanges = ['transform', 'transition']
    this.willChange()
    styleUtil(this.el, 'backface-visibility', 'hidden')
    styleUtil(this.el, 'perspective', '500em')

    function func() {
      if (self.el) {
        if (self.mode === 'scroll') {
          let containerPos_ = self.containerPos
          let bulletPos = self.el.getBoundingClientRect()
          if (self.direction === 'b2t') {
            if (bulletPos && bulletPos.bottom <= containerPos_.top + 100) {
              self.status = 'end'
              self.remove()
            } else {
              self.pauseMove(containerPos_)
              if (self.danmu.status !== 'paused') {
                self.startMove(containerPos_)
              }
            }
          } else {
            if (bulletPos && bulletPos.right <= containerPos_.left + 100) {
              self.status = 'end'
              self.remove()
            } else {
              self.pauseMove(containerPos_)
              if (self.danmu.status !== 'paused') {
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
    if (this.mode === 'scroll') {
      if (this.direction === 'b2t') {
        this.moveV = ((containerPos.height + this.height) / this.duration) * 1000
        let leftDuration = (self.el.getBoundingClientRect().bottom - containerPos.top) / this.moveV
        styleUtil(this.el, 'transition', `transform ${leftDuration}s linear 0s`)
        this.reqStartMoveId = requestAnimationFrame(() => {
          if (self.el) {
            styleUtil(
              self.el,
              'transform',
              `translateX(-${self.top}px) translateY(-${self.height}px) translateZ(0px) rotate(90deg)`
            )
            self.moveTime = new Date().getTime()
            self.moveMoreS = self.el.getBoundingClientRect().top - containerPos.top
            self.moveContainerHeight = containerPos.height
            self.removeTimer = setTimeout(func, leftDuration * 1000)
          }
        })
      } else {
        let bulletPos = this.el.getBoundingClientRect()
        this.moveV = ((containerPos.width + this.width) / this.duration) * 1000
        let leftDuration = (bulletPos.right - containerPos.left) / this.moveV
        styleUtil(this.el, 'transition', `transform ${leftDuration}s linear 0s`)
        // this.el.style.left = bulletPos.left + 'px'
        this.reqStartMoveId = requestAnimationFrame(() => {
          if (self.el) {
            let bulletPos = self.el.getBoundingClientRect()
            // self.el.style.left = bulletPos.left + 'px'
            let v = (bulletPos.right - containerPos.left) / leftDuration
            // console.log(`${self.id} 距离: ${bulletPos.right - containerPos.left}px 时间: ${leftDuration} 速度: ${v} 预定速度: ${self.moveV}`)
            // console.log(`${self.id} translateX(-${bulletPos.right - containerPos.left}px) translateY(0px) translateZ(0px)`)

            if (bulletPos.right > containerPos.left && v > self.moveV - 1 && v < self.moveV + 1) {
              styleUtil(
                self.el,
                'transform',
                `translateX(-${bulletPos.right - containerPos.left}px) translateY(0px) translateZ(0px)`
              )
              self.moveTime = new Date().getTime()
              self.moveMoreS = bulletPos.left - containerPos.left
              self.moveContainerWidth = containerPos.width
              self.removeTimer = setTimeout(func, leftDuration * 1000)
            } else {
              self.status = 'end'
              self.remove()
            }
          }
        })
      }
    } else {
      // this.el.style.width = `${this.width}px`
      // this.el.style.height = `${this.height}px`
      styleUtil(this.el, 'left', '50%')
      styleUtil(this.el, 'margin', `0 0 0 -${this.width / 2}px`)
      if (!this.pastDuration) {
        this.pastDuration = 1
      }
      let leftDuration = this.duration >= this.pastDuration ? this.duration - this.pastDuration : 0
      this.removeTimer = setTimeout(func, leftDuration)
      this.startTime = new Date().getTime()
    }
  }
  remove() {
    this.logger && this.logger.info(`remove #${this.options.txt || '[DOM Element]'}#`)
    // console.log('remove')
    let self = this
    if (this.removeTimer) {
      clearTimeout(this.removeTimer)
    }
    if (this.reqStartMoveId) {
      cancelAnimationFrame(this.reqStartMoveId)
      this.reqStartMoveId = null
    }
    if (self.el && self.el.parentNode) {
      this.willChanges = []
      this.willChange()

      self.detach()
      if (this.options.el && this.options.el.nodeType === 1 && this.danmu.config.disableCopyDOM) {
        styleUtil(this.options.el, 'transform', 'none')
      }
      self.danmu.emit('bullet_remove', {
        bullet: self
      })
    }
  }
  setFontSize(size) {
    if (this.el) {
      this.el.style['fontSize'] = size
    }
  }
  setLikeDom(el, style) {
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
