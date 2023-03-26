import EventEmitter from 'event-emitter'
import { version } from '../version.json'
import BaseClass from './baseClass'
import Control from './control'
import RecyclableDomList from './domRecycle'
import { addObserver, unObserver } from './resizeObserver'
import { addClass, deepCopy, isNumber, styleUtil } from './utils/util'

/**
 * @typedef {import('./baseClass').CommentData} CommentData
 */
/**
 * @typedef {import('./baseClass').GlobalHooks} GlobalHooks
 */

export class DanmuJs extends BaseClass {
  constructor(options) {
    super()

    // logger
    this.setLogger('danmu')
    this.logger && this.logger.info(`danmu.js version: ${version}`)

    // configure
    const config = (this.config = {
      overlap: false,
      area: {
        start: 0,
        end: 1,
        lines: undefined
      },
      hooks: undefined,
      live: false,
      comments: [],
      direction: 'r2l',
      needResizeObserver: false,
      dropStaleComments: false,
      channelSize: undefined,
      maxCommentsLength: undefined,
      bulletOffset: undefined,
      interval: 2000,
      highScorePriority: true, // 高积分优先展示
      chaseEffect: true // 滚动弹幕追逐效果
    })
    deepCopy(config, options)

    // Add event subscription handler
    EventEmitter(this)

    /**
     * @type {GlobalHooks}
     */
    this.globalHooks = {}
    if (config.hooks) {
      this.hooks(config.hooks)
    }

    this.hideArr = []
    this.recycler = new RecyclableDomList()

    // freezed comment
    this.freezeId = null

    config.comments.forEach((comment) => {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.mode) {
        comment.mode = 'scroll'
      }
    })

    /**
     * @type {HTMLElement}
     */
    this.container = config.container && config.container.nodeType === 1 ? config.container : null
    if (!this.container) {
      // eslint-disable-next-line quotes
      this.emit('error', "container id can't be empty")
      return false
    }
    if (config.containerStyle) {
      let style = config.containerStyle
      Object.keys(style).forEach(function (key) {
        this.container.style[key] = style[key]
      })
    }
    addClass(this.container, 'danmu')
    this.live = config.live
    this.player = config.player
    this.direction = config.direction
    this.bulletBtn = new Control(this)
    this.main = this.bulletBtn.main
    this.isReady = true
    this.emit('ready')
    this.logger && this.logger.info('ready')
    this.addResizeObserver()
  }

  get status() {
    return this.main.status
  }

  get state() {
    const main = this.main
    return {
      status: main.status,
      comments: main.data,
      bullets: main.queue,
      displayArea: main.channel.getRealOccupyArea()
    }
  }

  get containerPos() {
    return this.main.channel.containerPos
  }

  /**
   * @param {GlobalHooks} options
   */
  hooks(options) {
    deepCopy(this.globalHooks, options)
  }

  addResizeObserver() {
    this.config.needResizeObserver &&
      addObserver(this.container, () => {
        this.logger && this.logger.info('needResizeObserver')
        this.resize()
      })
  }

  start() {
    this.logger && this.logger.info('start')
    this.main.start()
  }

  pause() {
    this.logger && this.logger.info('pause')
    this.main.pause()
  }

  play() {
    this.logger && this.logger.info('play')
    this.main.play()
  }

  stop() {
    this.logger && this.logger.info('stop')
    this.main.stop()
  }

  clear() {
    this.logger && this.logger.info('clear')
    this.main.clear()
  }

  destroy() {
    unObserver(this.container)
    this.logger && this.logger.info('destroy')
    this.stop()
    this.bulletBtn.destroy()
    this.recycler.destroy()
    for (let k in this) {
      delete this[k]
    }
    this.emit('destroy')
  }

  /**
   * @param {CommentData} comment
   */
  sendComment(comment) {
    const { main, logger } = this
    logger && logger.info(`sendComment: ${comment.txt || '[DOM Element]'}`)

    if (!main) return

    // Set a default bullet show time
    if (!comment.duration) {
      comment.duration = 15000
    }

    if (comment && comment.id && comment.duration && (comment.el || comment.elLazyInit || comment.txt)) {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.style) {
        comment.style = {
          opacity: undefined,
          fontSize: undefined
        }
      }
      if (comment.style) {
        if (this.opacity && this.opacity !== comment.style.opacity) {
          comment.style.opacity = this.opacity
        }
        if (this.fontSize && this.fontSize !== comment.style.fontSize) {
          comment.style.fontSize = this.fontSize
        }
      }
      if (comment.prior || comment.realTime) {
        main.data.unshift(comment)
        if (comment.realTime) {
          main.readData()
          main.dataHandle()
        }
      } else {
        main.data.push(comment)
      }

      main.sortData()
      main.keepPoolWatermark()
    }
  }

  setCommentID(oldID, newID) {
    this.logger && this.logger.info(`setCommentID: oldID ${oldID} newID ${newID}`)
    if (oldID && newID) {
      this.main.data.some((data) => {
        if (data.id === oldID) {
          data.id = newID
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item) => {
        if (item.id === oldID) {
          item.id = newID
          item.pauseMove()
          this.main.status !== 'paused' && item.startMove()
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentDuration(id, duration) {
    this.logger && this.logger.info(`setCommentDuration: id ${id} duration ${duration}`)

    if (id && duration) {
      duration = duration ? duration : 5000
      this.main.data.some((data) => {
        if (data.id === id) {
          data.duration = duration
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item) => {
        if (item.id === id) {
          item.duration = duration
          item.pauseMove()
          this.main.status !== 'paused' && item.startMove()
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentLike(id, like) {
    this.logger && this.logger.info(`setCommentLike: id ${id} like ${like}`)
    if (id && like) {
      this.main.data.some((data) => {
        if (data.id === id) {
          data.like = like
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item) => {
        if (item.id === id) {
          item.pauseMove()
          item.setLikeDom(like.el, like.style)
          if (item.danmu.main.status !== 'paused') {
            item.startMove()
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  restartComment(id) {
    this.logger && this.logger.info(`restartComment: id ${id}`)

    if (id) {
      const self = this
      const main = self.main

      self._releaseCtrl(id)

      if (main.status === 'closed') {
        // The main process has been stopped, there is no need to drive the barrage to run
        return
      }

      main.queue.some((item) => {
        if (item.id === id) {
          if (main.status !== 'paused') {
            item.startMove(true)
          } else {
            item.status = 'paused'
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  /**
   * @private
   */
  _releaseCtrl(id) {
    const self = this

    if (self.freezeId && id === self.freezeId) {
      self.mouseControl = false
      self.freezeId = null
    }
  }

  /**
   * @private
   */
  _freezeCtrl(id) {
    this.mouseControl = true
    this.freezeId = id
  }

  freezeComment(id) {
    this.logger && this.logger.info(`freezeComment: id ${id}`)

    if (id) {
      const self = this

      self._freezeCtrl(id)

      self.main.queue.some((item) => {
        if (item.id === id) {
          item.status = 'forcedPause'
          item.pauseMove()
          if (item.el && item.el.style) {
            styleUtil(item.el, 'zIndex', 10)
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  removeComment(id) {
    this.logger && this.logger.info(`removeComment: id ${id}`)

    if (id) {
      const self = this
      self._releaseCtrl(id)

      self.main.queue.some((item) => {
        if (item.id === id) {
          item.remove()
          return true
        } else {
          return false
        }
      })
      //   self.main.data = self.main.data.filter((item) => {
      //     const keepIt = item.id !== id

      //     if (!keepIt) {
      //       self.main.dataElHandle([item])
      //     }
      //     return keepIt
      //   })
    }
  }

  /**
   * @param {Array<CommentData>} comments
   * @param {boolean} isClear
   */
  updateComments(comments, isClear = true) {
    this.logger && this.logger.info(`updateComments: ${comments.length}, isClear ${isClear}`)
    const { main } = this
    if (typeof isClear === 'boolean' && isClear) {
      //   main.dataElHandle(main.data)
      main.data = []
    }
    main.data = main.data.concat(comments)
    main.sortData()
    main.keepPoolWatermark()
  }

  /**
   * 设置所有弹幕播放时长
   * @param {number} duration
   */
  setAllDuration(mode = 'scroll', duration, force = true) {
    this.logger && this.logger.info(`setAllDuration: mode ${mode} duration ${duration} force ${force}`)
    if (duration) {
      duration = duration ? duration : 5000
      if (force) {
        this.main.forceDuration = duration
      }
      this.main.data.forEach((data) => {
        if (mode === data.mode) {
          data.duration = duration
        }
      })
      this.main.queue.forEach((item) => {
        if (mode === item.mode) {
          item.duration = duration
          item.pauseMove()
          if (this.main.status !== 'paused') {
            item.startMove()
          }
        }
      })
    }
  }

  /**
   * 设置弹幕播放速率，在弹幕播放速度上乘以一个系数，控制速度的变化
   * @param {number} val
   */
  setPlayRate(mode = 'scroll', val) {
    this.logger && this.logger.info(`setPlayRate: ${val}`)
    if (isNumber(val) && val > 0) {
      this.main.playRate = val
      this.main.queue.forEach((item) => {
        if (mode === item.mode) {
          item.pauseMove()
          if (this.main.status !== 'paused') {
            item.startMove()
          }
        }
      })
    }
  }

  setOpacity(opacity) {
    this.logger && this.logger.info(`setOpacity: opacity ${opacity}`)
    this.container.style.opacity = opacity
  }

  setFontSize(
    size,
    channelSize,
    options = {
      reflow: true
    }
  ) {
    this.logger && this.logger.info(`setFontSize: size ${size} channelSize ${channelSize}`)
    this.fontSize = `${size}px`
    if (size) {
      this.main.data.forEach((data) => {
        if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
      this.main.queue.forEach((item) => {
        if (!item.options.style) {
          item.options.style = {}
        }

        item.options.style.fontSize = this.fontSize
        item.setFontSize(this.fontSize)
        if (channelSize) {
          item.top = item.channel_id[0] * channelSize
          item.topInit()
        }
      })
    }
    if (channelSize) {
      this.config.channelSize = channelSize

      if (options.reflow) {
        this.main.channel.resizeSync()
      }
    }
  }

  setArea(area) {
    this.logger && this.logger.info(`setArea: area ${area}`)
    this.config.area = area

    if (area.reflow !== false) {
      this.main.channel.resizeSync()
    }
  }

  hide(mode = 'scroll') {
    this.logger && this.logger.info(`hide: mode ${mode}`)
    if (this.hideArr.indexOf(mode) < 0) {
      this.hideArr.push(mode)
    }
    let arr = this.main.queue.filter((item) => mode === item.mode || (mode === 'color' && item.color))
    arr.forEach((item) => item.remove())
  }

  show(mode = 'scroll') {
    this.logger && this.logger.info(`show: mode ${mode}`)
    let index = this.hideArr.indexOf(mode)
    if (index > -1) {
      this.hideArr.splice(index, 1)
    }
  }

  /**
   * @param {'r2l'|'b2t'} direction
   */
  setDirection(direction = 'r2l') {
    this.logger && this.logger.info(`setDirection: direction ${direction}`)
    this.direction = direction
    // this.main.channel.resize()
    this.emit('changeDirection', direction)
  }

  resize() {
    this.logger && this.logger.info('resize')
    this.emit('channel_resize')
  }
}

export default DanmuJs
