import BaseClass from './baseClass'
import Log from './utils/logger'
import { copyDom, getTimeStamp, isFunction, isNumber, styleCSSText, styleUtil } from './utils/util'

// 减少频繁的内存创建
const logger = new Log('bullet')

/**
 * [Bullet 弹幕构造类]
 *
 * @description
 *  1. 几乎所有事件都可以被代理（包括CSS事件），Bullet内不要进行事件绑定。所有事件绑定均在main层处理
 */
export class Bullet extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   * @param {import('./baseClass').CommentData} options
   */
  constructor(danmu, options = {}) {
    super()
    const { container, recycler, config } = danmu

    this.setLogger(logger)
    // this.logger && this.logger.info('options.moveV', options.moveV)
    this.danmu = danmu
    this.options = options
    /** @type {number} - milliseconds */
    this.duration = options.duration
    this.id = options.id
    this.container = container
    /** @type {'scroll' | 'top' | 'bottom'} */
    this.mode = options.mode === 'top' || options.mode === 'bottom' ? options.mode : 'scroll'
    this.start = options.start
    this.prior = options.prior
    this.realTime = options.realTime
    this.color = options.color
    this.bookChannelId = options.bookChannelId
    this.reuseDOM = true
    this.noCopyEl = !!(config.disableCopyDOM || options.disableCopyDOM)
    this.recycler = recycler
    /**
     * @type {number} - seconds
     * @private
     */
    this._fullySlideInScreenDuration = undefined
    /**
     * @type {number} - milliseconds
     * @private
     */
    this._lastMoveTime = undefined
    /** @type {'waiting'|'start'|'end'} */
    this.status = 'waiting'

    if (!options.elLazyInit) {
      this.bulletCreateFail = !this._makeEl()
    }
    this.startTime = 0;
    this.fullEnterTime = 0;
    this.fullLeaveTime = 0;
    this.waitTimeStamp = 0;
  }
  get moveV() {
    const self = this
    const { danmu, options } = self
    let v = self._moveV

    if (!v) {
      if (options.moveV) {
        v = options.moveV
      } else {
        if (self.elPos) {
          const ctPos = danmu.containerPos
          const distance =
            self.direction === 'b2t'
              ? ctPos.height + (danmu.config.chaseEffect ? self.height : 0)
              : ctPos.width + (danmu.config.chaseEffect ? self.width : 0)

          v = (distance / self.duration) * 1000
        }
      }

      if (v) {
        v *= danmu.main.playRate

        // 固化速度，否则resize时外部获取当前弹幕时会重新计算速度，导致布局异常（重叠），同时提高性能。
        self._moveV = v
      }
    }
    return v
  }

  get moveVV1() {
    if (!this.width) {
      this.width = this.el.offsetWidth;
      this.options.width = this.width;
    }
    const containerWidth = this.danmu.containerPos.width || 0;
    return (containerWidth + this.width) / this.duration;
  }

  get direction() {
    return this.danmu.direction
  }
  get fullySlideIntoScreen() {
    const self = this
    let flag = true

    if (self.mode === 'scroll' && self._lastMoveTime && self._fullySlideInScreenDuration > 0) {
      const now = new Date().getTime()
      const diff = (now - self._lastMoveTime) / 1000

      if (diff >= self._fullySlideInScreenDuration) {
        flag = true
      } else {
        flag = false
      }
    }
    return flag
  }

  /**
   * @private
   * @returns {Boolean}
   */
  _makeEl() {
    const { danmu, options } = this
    const { config, globalHooks } = danmu
    /**
     * @type {HTMLElement}
     */
    let el
    let cssText = ''
    let style = options.style || {}

    // The use of translate3d pushes css animations into hardware acceleration for more power!
    // Use 'perspective' to try to fix flickering problem after switching to the transform above
    style['perspective'] = '500em'

    // !!! 'backface-visibility' will cause translateX/Y stop rendering in firefox
    // style['backfaceVisibility'] = 'hidden'
    // style['webkitBackfaceVisibility'] = 'hidden'

    if (options.el || options.elLazyInit) {
      if (this.noCopyEl) {
        this.reuseDOM = false
      }

      if (options.elLazyInit) {
        if (isFunction(globalHooks.bulletCreateEl)) {
          try {
            const result = globalHooks.bulletCreateEl(options)

            if (result instanceof HTMLElement) {
              el = result
            } else {
              el = result.el
            }
          } catch (e) {}
        }
      } else {
        if (options.el.nodeType === 1 && !options.el.parentNode) {
          if (this.reuseDOM) {
            let copyDOM = copyDom(options.el)
            if (options.eventListeners && options.eventListeners.length > 0) {
              options.eventListeners.forEach((eventListener) => {
                copyDOM.addEventListener(eventListener.event, eventListener.listener, eventListener.useCapture || false)
              })
            }
            el = this.recycler.use()
            if (el.childNodes.length > 0) {
              el.innerHTML = ''
            }
            if (el.textContent) {
              el.textContent = ''
            }
            el.appendChild(copyDOM)
          } else {
            el = options.el
          }
        }
      }
    } else if (typeof options.txt === 'string') {
      el = this.recycler.use()
      el.textContent = options.txt
    }

    if (!el || !danmu.main) {
      return false
    }

    let offset
    if (isNumber(config.bulletOffset) && config.bulletOffset >= 0) {
      offset = config.bulletOffset
    } else {
      const containerPos = danmu.containerPos
      offset = containerPos.width / 10 > 100 ? 100 : containerPos.width / 10
    }
    const random = options.realTime ? 0 : Math.floor(Math.random() * offset)
    const left = this.updateOffset(random, true)

    style.left = left
    Object.keys(style).forEach((key) => {
      const bbqKey = key.replace(/[A-Z]/g, (val) => {
        return '-' + val.toLowerCase()
      })
      cssText += `${bbqKey}:${style[key]};`
    })
    styleCSSText(el, cssText)

    /**
     * @type {HTMLElement}
     */
    this.el = el
    if (options.like && options.like.el) {
      this.setLikeDom(options.like.el, options.like.style)
    }

    return true
  }

  _makeElV1() {
    const { danmu, options } = this;
    const { globalHooks } = danmu;
    let el;
    let cssText = ''
    let style = options.style || {}
    // 删除 style['perspective'] = '500em'
    //给元素设置绝对定位，获取宽高时脱离文档流避免连锁重排
    style.position = 'absolute'; 
    this.reuseDOM = false
    if (options.elLazyInit && isFunction(globalHooks.bulletCreateEl)) {
      try {
        const result = globalHooks.bulletCreateEl(options);
        if (result instanceof HTMLElement) {
          el = result;
        } else {
          el = result.el;
        }
      } catch (e) {
        console.log('danmakulogger', '创建dom元素失败', options);
      }
    }

    if (!el || !danmu.main) {
      return false;
    }

    style.left = this.updateOffset(0, true);
    Object.keys(style).forEach((key) => {
      const bbqKey = key.replace(/[A-Z]/g, (val) => {
        return '-' + val.toLowerCase();
      })
      cssText += `${bbqKey}:${style[key]};`;
    });
    styleCSSText(el, cssText);

    this.el = el;
    return true;
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

    if (self.options.elLazyInit && !self.el) {
      self._makeEl()
    }

    // 防止外部钩子进行弹幕实例销毁，或者其他异常操作
    if (!self.danmu || !self.danmu.main) {
      return
    }

    const { danmu, options, el } = self
    const { globalHooks } = danmu

    if (globalHooks.bulletAttaching) {
      globalHooks.bulletAttaching(options)
    }

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

    if (globalHooks.bulletAttached) {
      globalHooks.bulletAttached(options, el)
    }
  }

  attachV1() {
    const { danmu, options } = this;
    const { globalHooks } = danmu;

    if (!danmu || !danmu.main) {
      return;
    }

    if (options.elLazyInit && !this.el) {
      this._makeElV1();
    }
    
    if (!this.container.contains(this.el)) {
      this.container.appendChild(this.el);
    }

    if (!this.width) {
      if (options.width) {
        this.width = options.width;
      } else {
        this.elPos = this.el.getBoundingClientRect()        
        this.width = this.elPos.width;
        options.width = this.width;
      }
    }

    if (globalHooks.bulletAttached) {
      globalHooks.bulletAttached(options, this.el);
    }
  }

  detach() {
    // this.logger && this.logger.info(`detach #${this.options.txt || '[DOM Element]'}#`)
    const self = this
    const { el, danmu, options } = self
    const { globalHooks } = danmu

    if (el) {
      // run hooks
      if (globalHooks.bulletDetaching) {
        globalHooks.bulletDetaching(options)
      }

      if (self.reuseDOM) {
        self.recycler.unused(el)
      } else {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      }

      // run hooks
      if (globalHooks.bulletDetached) {
        globalHooks.bulletDetached(options, el)
      }

      self.el = null
    }

    self.elPos = undefined
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
        let pastDuration = (new Date().getTime() - self._lastMoveTime) / 1000
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
    if (this.danmu.config.trackAllocationOptimization) {
      this.startMoveV1(force);
    } else {
      this.startMoveV0(force);
    }
  }

  startMoveV0(force) {
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

    if (this.mode === 'scroll') {
      const ctPos = self.danmu.containerPos
      if (!self.el) {
        return
      }
      const bulletPos = self.el.getBoundingClientRect()
      let fullyMovedToScreenDistance

      if (this.direction === 'b2t') {
        fullyMovedToScreenDistance = bulletPos.bottom - ctPos.bottom

        let leftDuration = (bulletPos.bottom - ctPos.top) / this.moveV
        styleUtil(self.el, 'transition', `transform ${leftDuration}s linear 0s`)
        styleUtil(
          self.el,
          'transform',
          `translateX(-${self.top}px) translateY(-${self.height}px) translateZ(0px) rotate(90deg)`
        )
        self._lastMoveTime = new Date().getTime()
        self.moveMoreS = bulletPos.top - ctPos.top
        self.moveContainerHeight = ctPos.height
      } else {
        fullyMovedToScreenDistance = bulletPos.right - ctPos.right
        const leftDistance = bulletPos.right - ctPos.left
        const leftDuration = leftDistance / self.moveV

        if (bulletPos.right > ctPos.left) {
          styleUtil(self.el, 'transition', `transform ${leftDuration}s linear 0s`)
          styleUtil(self.el, 'transform', `translateX(-${leftDistance}px) translateY(0px) translateZ(0px)`)

          self._lastMoveTime = new Date().getTime()
          self.moveMoreS = bulletPos.left - ctPos.left
          self.moveContainerWidth = ctPos.width
        } else {
          self.status = 'end'
          self.remove()
        }
      }

      self._fullySlideInScreenDuration = fullyMovedToScreenDistance / self.moveV
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

  startMoveV1(force) {
    const currentTime = getTimeStamp();
    if (!this.el || this.status === 'start' || this.status === 'forcedPause' && !force || this.waitTimeStamp > currentTime) {
      return;
    }

    const originStatus = this.status;
    if (originStatus !== 'forcedPause') {
      if (this.fullLeaveTime && this.fullLeaveTime < currentTime) {
        this.remove();
        this.status = 'end';
        return;
      }
    }

    this.waitTimeStamp = 0;
    const containerPos = this.danmu.containerPos;
    this.status = 'start';

    if (originStatus === 'paused') {
      const bulletPos = this.el.getBoundingClientRect();
      const leftDistance = bulletPos.right - containerPos.left;
      const leftDuration = leftDistance / this.moveVV1;

      if (bulletPos.right > containerPos.left) { // 元素还在可视区域内
        styleUtil(this.el, 'transition', `transform ${leftDuration / 1000}s linear 0s`);
        styleUtil(this.el, 'transform', `translateX(-${leftDistance}px) translateY(0px) translateZ(0px)`);

        if (bulletPos.right > containerPos.left) { // 如果元素没有完全进入屏幕，更新完全进入屏幕时间
          this.fullEnterTime = currentTime + (bulletPos.right - containerPos.left) / this.moveVV1;
        }

        this.fullLeaveTime = currentTime + leftDuration; // 更新离屏时间
      } else {
        this.status = 'end';
        this.remove();
      }
    } else {
      const els = this.el;
      styleUtil(els, 'transition', `transform ${this.duration / 1000}s linear 0s`);
      styleUtil(els, 'transform', `translateX(-${containerPos.width + this.width}px) translateY(0px) translateZ(0px)`);

      this.startTime = getTimeStamp();
      this.endTime = this.startTime + this.duration;
      this.fullEnterTime = this.startTime + this.width / this.moveVV1;
      console.log('fullEnterTime11', this.startTime, this.width, this.moveVV1, this.fullEnterTime, `startTime_${this.startTime}`, `width_${this.width}`, `perspective_${this.fullEnterTime}`, `moveVV1_${this.moveVV1}`);
      this.fullLeaveTime = this.startTime + this.duration;
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
      if (this.options.el && this.options.el.nodeType === 1 && this.noCopyEl) {
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
