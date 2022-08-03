import BaseClass from './baseClass'
import { copyDom, styleUtil } from './utils/util'

/**
 * [Bullet 弹幕构造类]
 */
export class Bullet extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu, options) {
    super()
    // this.logger && this.logger.info('options.moveV', options.moveV)
    const self = this
    let el

    this.setLogger('bullet')
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

    const containerPos = danmu.containerPos
    let random = Math.floor(Math.random() * (containerPos.width / 10 > 100 ? 200 : containerPos.width / 10))
    if (options.realTime) {
      random = 0
    }
    styleUtil(this.el, 'left', containerPos.width + random + 'px')
  }
  attach() {
    // this.logger && this.logger.info(`attach #${this.options.txt || '[DOM Element]'}#`)
    const self = this
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
      self.duration = ((self.danmu.containerPos.width + self.width) / self.moveV) * 1000
    }
    if (self.danmu.config) {
      if (self.danmu.config.mouseControl) {
        self.mouseoverFunWrapper = self.mouseoverFun.bind(self)
        self.el.addEventListener('mouseover', self.mouseoverFunWrapper, false)
      }
      if (self.danmu.config.mouseEnterControl) {
        self.mouseEnterFunWrapper = self.mouseoverFun.bind(self)
        self.el.addEventListener('mouseenter', self.mouseEnterFunWrapper, false)
      }
    }
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
  topInit() {
    this.logger && this.logger.info(`topInit #${this.options.txt || '[DOM Element]'}#`)
    if (this.direction === 'b2t') {
      styleUtil(this.el, 'transformOrigin', 'left top')
      styleUtil(
        this.el,
        'transform',
        `translateX(-${this.top}px) translateY(${this.danmu.containerPos.height}px) translateZ(0px) rotate(90deg)`
      )
      styleUtil(this.el, 'transition', 'transform 0s linear 0s')
    } else {
      styleUtil(this.el, 'top', `${this.top}px`)
    }
  }
  pauseMove(isFullscreen = false) {
    // this.logger && this.logger.info(`pauseMove #${this.options.txt || '[DOM Element]'}#`)
    const self = this
    if (self.status === 'paused') {
      return
    }
    if (self.status !== 'forcedPause') {
      this.status = 'paused'
    }
    self._clearAsyncTimer()

    if (!this.el) {
      return
    }
    this.willChange()
    if (this.mode === 'scroll') {
      const ctPos = self.danmu.containerPos
      if (isFullscreen) {
        let pastDuration = (new Date().getTime() - self.moveTime) / 1000
        let pastS = pastDuration * this.moveV
        let ratio = 0
        let nowS = 0
        if (self.moveMoreS - pastS >= 0) {
          if (this.direction === 'b2t') {
            ratio = (self.moveMoreS - pastS) / self.moveContainerHeight
            nowS = ratio * ctPos.height
          } else {
            ratio = (self.moveMoreS - pastS) / self.moveContainerWidth
            nowS = ratio * ctPos.width
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
              this.el.getBoundingClientRect().top - ctPos.top
            }px) translateZ(0px) rotate(90deg)`
          )
        } else {
          styleUtil(this.el, 'left', `${this.el.getBoundingClientRect().left - ctPos.left}px`)
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
  startMove(force, immediately = false) {
    // this.logger && this.logger.info(`startMove #${this.options.txt || '[DOM Element]'}#`)
    let self = this
    if (!self.hasMove) {
      self.danmu.emit('bullet_start', self)
      self.hasMove = true
    }
    if (self.status === 'forcedPause' && !force) return
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
          let containerPos_ = self.danmu.containerPos
          let bulletPos = self.el.getBoundingClientRect()
          if (self.direction === 'b2t') {
            if (bulletPos && bulletPos.bottom <= containerPos_.top + 100) {
              self.status = 'end'
              self.remove()
            } else {
              self.pauseMove()
              if (self.danmu.status !== 'paused') {
                self.startMove()
              }
            }
          } else {
            if (bulletPos && bulletPos.right <= containerPos_.left + 100) {
              self.status = 'end'
              self.remove()
            } else {
              self.pauseMove()
              if (self.danmu.status !== 'paused') {
                self.startMove()
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
      const ctPos = self.danmu.containerPos

      if (this.direction === 'b2t') {
        this.moveV = ((ctPos.height + this.height) / this.duration) * 1000
        let leftDuration = (self.el.getBoundingClientRect().bottom - ctPos.top) / this.moveV
        styleUtil(this.el, 'transition', `transform ${leftDuration}s linear 0s`)
        this.reqStartMoveId = requestAnimationFrame(() => {
          if (self.el) {
            styleUtil(
              self.el,
              'transform',
              `translateX(-${self.top}px) translateY(-${self.height}px) translateZ(0px) rotate(90deg)`
            )
            self.moveTime = new Date().getTime()
            self.moveMoreS = self.el.getBoundingClientRect().top - ctPos.top
            self.moveContainerHeight = ctPos.height
            self.removeTimer = setTimeout(func, leftDuration * 1000)
          }
        })
      } else {
        const reflow = () => {
          if (!self.el) {
            return
          }
          self.moveV = ((ctPos.width + self.width) / self.duration) * 1000
          const bulletPos = self.el.getBoundingClientRect()
          const leftDuration = (bulletPos.right - ctPos.left) / self.moveV

          styleUtil(self.el, 'transition', `transform ${leftDuration}s linear 0s`)

          // self.el.style.left = bulletPos.left + 'px'
          let v = (bulletPos.right - ctPos.left) / leftDuration
          // console.log(`${self.id} 距离: ${bulletPos.right - containerPos.left}px 时间: ${leftDuration} 速度: ${v} 预定速度: ${self.moveV}`)
          // console.log(`${self.id} translateX(-${bulletPos.right - containerPos.left}px) translateY(0px) translateZ(0px)`)

          if (bulletPos.right > ctPos.left && v > self.moveV - 1 && v < self.moveV + 1) {
            styleUtil(
              self.el,
              'transform',
              `translateX(-${bulletPos.right - ctPos.left}px) translateY(0px) translateZ(0px)`
            )
            self.moveTime = new Date().getTime()
            self.moveMoreS = bulletPos.left - ctPos.left
            self.moveContainerWidth = ctPos.width
            self.removeTimer = setTimeout(func, leftDuration * 1000)
          } else {
            self.status = 'end'
            self.remove()
          }
        }

        if (immediately) {
          reflow()
        } else {
          this.reqStartMoveId = requestAnimationFrame(() => {
            reflow()
          })
        }
      }
    } else {
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
    const self = this

    self._clearAsyncTimer()
    self.pauseMove()

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

  /**
   * @private
   */
  _clearAsyncTimer() {
    if (this.removeTimer) {
      clearTimeout(this.removeTimer)
      this.removeTimer = null
    }
    if (this.reqStartMoveId) {
      cancelAnimationFrame(this.reqStartMoveId)
      this.reqStartMoveId = null
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
