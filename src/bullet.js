import BaseClass from './baseClass'
import { copyDom, isNumber, styleUtil, styleCSSText } from './utils/util'

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

    /**
     * @type {HTMLElement}
     */
    let el
    let cssText = ''
    let style = options.style || {}

    this.setLogger('bullet')
    this.danmu = danmu
    this.options = options
    this.duration = options.duration
    this.id = options.id
    this.container = danmu.container
    this.start = options.start
    this.prior = options.prior
    this.realTime = options.realTime
    this.color = options.color
    this.bookChannelId = options.bookChannelId
    this.direction = danmu.direction
    this.reuseDOM = true
    this.domObj = danmu.domObj

    if (options.el && options.el.nodeType === 1) {
      if (options.el.parentNode) return { bulletCreateFail: true }
      if (danmu.config.disableCopyDOM || options.disableCopyDOM) {
        this.reuseDOM = false
        el = options.el
      } else {
        let copyDOM = copyDom(options.el)
        if (options.eventListeners && options.eventListeners.length > 0) {
          options.eventListeners.forEach((eventListener) => {
            copyDOM.addEventListener(eventListener.event, eventListener.listener, eventListener.useCapture || false)
          })
        }
        el = this.domObj.use()
        if (el.childNodes.length > 0) {
          el.innerHTML = ''
        }
        if (el.textContent) {
          el.textContent = ''
        }
        el.appendChild(copyDOM)
      }
    } else {
      el = this.domObj.use()
      el.textContent = options.txt
    }
    this.onChangeDirection = (direction) => {
      self.direction = direction
    }
    this.danmu.on('changeDirection', this.onChangeDirection)

    let offset
    if (isNumber(danmu.config.bulletOffset) && danmu.config.bulletOffset >= 0) {
      offset = danmu.config.bulletOffset
    } else {
      const containerPos = danmu.containerPos
      offset = containerPos.width / 10 > 100 ? 100 : containerPos.width / 10
    }
    const random = options.realTime ? 0 : Math.floor(Math.random() * offset)
    const left = this.updateOffset(random, true)

    style.left = left
    Object.keys(style).forEach(function (key) {
      cssText += `${key}:${style[key]};`
    })
    styleCSSText(el, cssText)

    if (options.mode === 'top' || options.mode === 'bottom') {
      this.mode = options.mode
    } else {
      this.mode = 'scroll'
    }

    /**
     * @type {HTMLElement}
     */
    this.el = el
    if (options.like && options.like.el) {
      this.setLikeDom(options.like.el, options.like.style)
    }
    this.status = 'waiting' // waiting,start,end
  }
  get moveV() {
    const self = this
    let v = self._moveV

    if (!v) {
      if (self.options.moveV) {
        v = self.options.moveV
      } else {
        if (self.elPos) {
          const ctPos = self.danmu.containerPos
          const distance = self.direction === 'b2t' ? ctPos.height + self.height : ctPos.width + self.width

          v = (distance / self.duration) * 1000
        }
      }

      if (v) {
        v *= self.danmu.main.playRate

        // 固化速度，否则resize时外部获取当前弹幕时会重新计算速度，导致布局异常（重叠），同时提高性能。
        self._moveV = v
      }
    }
    return v
  }
  updateOffset(val, dryRun = false) {
    this.random = val
    const left = this.danmu.containerPos.width + val + 'px'

    if (!dryRun) {
      styleUtil(this.el, 'left', this.danmu.containerPos.width + val + 'px')
    }

    return left
  }
  attach() {
    // this.logger && this.logger.info(`attach #${this.options.txt || '[DOM Element]'}#`)
    const self = this
    const el = self.el

    if (!self.container.contains(el)) {
      self.container.appendChild(el)
    }
    self.elPos = el.getBoundingClientRect()
    if (self.direction === 'b2t') {
      self.width = self.elPos.height
      self.height = self.elPos.width
    } else {
      self.width = self.elPos.width
      self.height = self.elPos.height
    }
    if (self.moveV) {
      self.duration = ((self.danmu.containerPos.width + self.random + self.width) / self.moveV) * 1000
    }
    if (self.danmu.config) {
      if (self.danmu.config.mouseControl) {
        self.mouseoverFunWrapper = self.mouseoverFun.bind(self)
        el.addEventListener('mouseover', self.mouseoverFunWrapper, false)
      }
      if (self.danmu.config.mouseEnterControl) {
        self.mouseEnterFunWrapper = self.mouseoverFun.bind(self)
        el.addEventListener('mouseenter', self.mouseEnterFunWrapper, false)
      }
    }

    self._onTransitionEnd = self._onTransitionEnd.bind(self)
    el.addEventListener('transitionend', self._onTransitionEnd, false)
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

      el.removeEventListener('transitionend', self._onTransitionEnd, false)

      if (self.reuseDOM) {
        self.domObj.unused(el)
      } else {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      }

      self.el = null
    }

    self.elPos = undefined
    self.danmu.off('changeDirection', this.onChangeDirection)
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
  /**
   * @private
   */
  _onTransitionEnd() {
    this.status = 'end'
    this.remove(false)
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

    // 将记忆速度删除，以备通过接口调整速度或duration时重计速度
    self._moveV = undefined

    if (!this.el) {
      return
    }
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
  startMove(force) {
    // this.logger && this.logger.info(`startMove #${this.options.txt || '[DOM Element]'}#`)
    const self = this
    if (!self.hasMove) {
      self.danmu.emit('bullet_start', self)
      self.hasMove = true
    }
    if (self.status === 'forcedPause' && !force) return
    if (!this.el) return
    if (this.status === 'start') return

    this.status = 'start'
    styleUtil(this.el, 'backface-visibility', 'hidden')
    styleUtil(this.el, 'perspective', '500em')

    if (this.mode === 'scroll') {
      const ctPos = self.danmu.containerPos

      if (this.direction === 'b2t') {
        let leftDuration = (self.el.getBoundingClientRect().bottom - ctPos.top) / this.moveV
        styleUtil(self.el, 'transition', `transform ${leftDuration}s linear 0s`)
        styleUtil(
          self.el,
          'transform',
          `translateX(-${self.top}px) translateY(-${self.height}px) translateZ(0px) rotate(90deg)`
        )
        self.moveTime = new Date().getTime()
        self.moveMoreS = self.el.getBoundingClientRect().top - ctPos.top
        self.moveContainerHeight = ctPos.height
        // self.removeTimer = setTimeout(func, leftDuration * 1000)
      } else {
        if (!self.el) {
          return
        }
        const bulletPos = self.el.getBoundingClientRect()
        const leftDistance = bulletPos.right - ctPos.left
        const leftDuration = leftDistance / self.moveV
        // const v = leftDistance / leftDuration * self.danmu.main.playRate
        // self.el.style.left = bulletPos.left + 'px'

        if (bulletPos.right > ctPos.left) {
          styleUtil(self.el, 'transition', `transform ${leftDuration}s linear 0s`)
          styleUtil(self.el, 'transform', `translateX(-${leftDistance}px) translateY(0px) translateZ(0px)`)

          self.moveTime = new Date().getTime()
          self.moveMoreS = bulletPos.left - ctPos.left
          self.moveContainerWidth = ctPos.width
        } else {
          self.status = 'end'
          self.remove()
        }
      }
    } else {
      const newTimestamp = new Date().getTime()
      const leftDuration =
        (this.startTime && newTimestamp - this.startTime > this.duration
          ? newTimestamp - this.startTime
          : this.duration) / 1000
      styleUtil(self.el, 'left', '50%')
      styleUtil(self.el, 'margin', `0 0 0 -${this.width / 2}px`)
      styleUtil(self.el, 'visibility', 'hidden')
      styleUtil(self.el, 'transition', `visibility ${leftDuration}s 0s`)
      if (!this.pastDuration) {
        this.pastDuration = 1
      }
      this.startTime = newTimestamp
    }
  }
  remove(needPause = true) {
    this.logger && this.logger.info(`remove #${this.options.txt || '[DOM Element]'}#`)
    const self = this

    if (needPause) {
      self.pauseMove()
    }

    if (self.el && self.el.parentNode) {
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
