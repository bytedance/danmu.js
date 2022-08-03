import EventEmitter from 'event-emitter'
import { version } from '../version.json'
import BaseClass from './baseClass'
import Control from './control'
import RecyclableDomList from './domRecycle'
import { addObserver, unObserver } from './resizeObserver'
import { addClass, deepCopy, styleUtil } from './utils/util'

export class DanmuJs extends BaseClass {
  constructor(options) {
    super()
    const self = this

    // logger
    self.setLogger('danmu')
    self.logger && self.logger.info(`danmu.js version: ${version}`)

    // configure
    const config = (self.config = {
      overlap: false,
      area: {
        start: 0,
        end: 1,
        lines: undefined
      },
      live: false,
      comments: [],
      direction: 'r2l',
      needResizeObserver: false,
      dropStaleComments: false,
      channelSize: undefined,
      maxCommentsLength: undefined,
      interval: 2000
    })
    deepCopy(config, options)

    // Add event subscription handler
    EventEmitter(self)

    self.hideArr = []
    self.domObj = new RecyclableDomList()

    // freezed comment
    self.freezeId = null

    config.comments.forEach((comment) => {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.mode) {
        comment.mode = 'scroll'
      }
    })

    /**
     * @type {HTMLElement}
     */
    self.container = config.container && config.container.nodeType === 1 ? config.container : null
    if (!self.container) {
      // eslint-disable-next-line quotes
      self.emit('error', "container id can't be empty")
      return false
    }
    if (config.containerStyle) {
      let style = config.containerStyle
      Object.keys(style).forEach(function (key) {
        self.container.style[key] = style[key]
      })
    }
    self.live = config.live
    self.player = config.player
    self.direction = config.direction
    addClass(self.container, 'danmu')
    self.bulletBtn = new Control(self)
    self.main = self.bulletBtn.main
    self.isReady = true
    self.emit('ready')
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
      bullets: main.queue
    }
  }

  get containerPos() {
    return this.main.channel.containerPos
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
    this.domObj.destroy()
    for (let k in this) {
      delete this[k]
    }
    this.emit('destroy')
  }

  sendComment(comment) {
    this.logger && this.logger.info(`sendComment: ${comment.txt || '[DOM Element]'}`)
    if (!comment.duration) {
      comment.duration = 15000
    }
    if (comment && comment.id && comment.duration && (comment.el || comment.txt)) {
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
        this.main.data.unshift(comment)
        if (comment.realTime) {
          this.main.readData()
          this.main.dataHandle()
        }
      } else {
        this.main.data.push(comment)
      }
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

    if (self.freezeId && id == self.freezeId) {
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
      self.main.data = self.main.data.filter((item) => {
        return item.id !== id
      })
    }
  }

  /**
   * @param {Array<import('./main').CommentData>} comments
   * @param {boolean} isClear
   */
  updateComments(comments, isClear = true) {
    const { config, main, player } = this
    const priorComments = []
    let deleteCount = 0

    this.logger && this.logger.info(`updateComments: ${comments.length}, isClear ${isClear}`)

    if (typeof isClear === 'boolean' && isClear) {
      main.data = []
    }
    main.data = main.data.concat(comments)
    main.sortData()

    // Support data pool to control watermark automatically
    if (typeof config.maxCommentsLength === 'number' && main.data.length > config.maxCommentsLength) {
      deleteCount = main.data.length - config.maxCommentsLength

      for (let i = 0, comment; i < deleteCount; i++) {
        comment = main.data[i]
        if (comment.prior && !comment._attached) {
          priorComments.push(main.data[i])
        }
      }
    } else if (config.dropStaleComments && player && player.currentTime) {
      const currentTime = Math.floor(player.currentTime * 1000),
        timePoint = currentTime - config.interval

      if (timePoint > 0) {
        for (let i = 0, comment; i < main.data.length; i++) {
          comment = main.data[i]
          if (comment.prior && !comment._attached) {
            priorComments.push(main.data[i])
          }

          if (comment.start > timePoint) {
            deleteCount = i
            break
          }
        }
      }

      if (deleteCount > 0) {
        main.data.splice(0, deleteCount)

        // Keep high-priority comments data.
        main.data = priorComments.concat(main.data)
      }
    }
  }

  willChange() {
    const { container, main } = this
    // optimize setOpacity
    container.style.willChange = 'opacity'

    // optimize setAllDuration/setFontSize
    main.willChanges.push('contents')
    main.queue.forEach((item) => {
      item.willChange()
    })
  }

  stopWillChange() {
    this.container.style.willChange = ''

    this.main.willChanges.splice(0) // empty
    this.main.queue.forEach((item) => {
      item.willChange()
    })
  }

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
        this.main.channel.resizeSync(true)
      }
    }
  }

  setArea(area) {
    this.logger && this.logger.info(`setArea: area ${area}`)
    this.config.area = area

    if (area.reflow !== false) {
      this.main.channel.resizeSync(true)
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

  setDirection(direction = 'r2l') {
    this.logger && this.logger.info(`setDirection: direction ${direction}`)
    this.emit('changeDirection', direction)
  }

  resize() {
    this.logger && this.logger.info('resize')
    this.emit('channel_resize')
  }
}

export default DanmuJs
