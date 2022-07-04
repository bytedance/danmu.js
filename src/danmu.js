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
    self.config = {
      overlap: false,
      area: {
        start: 0,
        end: 1,
        lines: undefined
      },
      live: false,
      comments: [],
      direction: 'r2l',
      needResizeObserver: false
    }
    deepCopy(self.config, options)

    // Add event subscription handler
    EventEmitter(self)

    self.hideArr = []
    self.domObj = new RecyclableDomList()
    
    self.config.comments.forEach((comment) => {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.mode) {
        comment.mode = 'scroll'
      }
    })
    if (self.config.container && self.config.container.nodeType === 1) {
      self.container = self.config.container
    } else {
      self.emit('error', "container id can't be empty")
      return false
    }
    if (self.config.containerStyle) {
      let style = self.config.containerStyle
      Object.keys(style).forEach(function (key) {
        self.container.style[key] = style[key]
      })
    }
    self.live = self.config.live
    self.player = self.config.player
    self.direction = self.config.direction
    addClass(self.container, 'danmu')
    self.bulletBtn = new Control(self)
    self.isReady = true
    self.emit('ready')
    this.logger && this.logger.info('ready')
    this.addResizeObserver()
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
    this.bulletBtn.main.start()
  }

  pause() {
    this.logger && this.logger.info('pause')
    this.bulletBtn.main.pause()
  }

  play() {
    this.logger && this.logger.info('play')
    this.bulletBtn.main.play()
  }

  stop() {
    this.logger && this.logger.info('stop')
    this.bulletBtn.main.stop()
  }

  clear() {
    this.logger && this.logger.info('clear')
    this.bulletBtn.main.clear()
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
      // console.log(comment.style)
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
        this.bulletBtn.main.data.unshift(comment)
        if (comment.realTime) {
          this.bulletBtn.main.readData()
          this.bulletBtn.main.dataHandle()
        }
      } else {
        this.bulletBtn.main.data.push(comment)
      }
    }
  }

  setCommentID(oldID, newID) {
    this.logger && this.logger.info(`setCommentID: oldID ${oldID} newID ${newID}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (oldID && newID) {
      this.bulletBtn.main.data.some((data) => {
        if (data.id === oldID) {
          data.id = newID
          return true
        } else {
          return false
        }
      })
      this.bulletBtn.main.queue.some((item) => {
        if (item.id === oldID) {
          item.id = newID
          item.pauseMove(containerPos_)
          this.bulletBtn.main.status !== 'paused' && item.startMove(containerPos_)
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentDuration(id, duration) {
    this.logger && this.logger.info(`setCommentDuration: id ${id} duration ${duration}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (id && duration) {
      duration = duration ? duration : 5000
      this.bulletBtn.main.data.some((data) => {
        if (data.id === id) {
          data.duration = duration
          return true
        } else {
          return false
        }
      })
      this.bulletBtn.main.queue.some((item) => {
        if (item.id === id) {
          item.duration = duration
          item.pauseMove(containerPos_)
          this.bulletBtn.main.status !== 'paused' && item.startMove(containerPos_)
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentLike(id, like) {
    this.logger && this.logger.info(`setCommentLike: id ${id} like ${like}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (id && like) {
      this.bulletBtn.main.data.some((data) => {
        if (data.id === id) {
          data.like = like
          return true
        } else {
          return false
        }
      })
      this.bulletBtn.main.queue.some((item) => {
        if (item.id === id) {
          item.pauseMove(containerPos_)
          item.setLikeDom(like.el, like.style)
          if (item.danmu.bulletBtn.main.status !== 'paused') {
            item.startMove(containerPos_)
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
    this.mouseControl = false
    let pos = this.container.getBoundingClientRect()
    if (id) {
      this.bulletBtn.main.queue.some((item) => {
        if (item.id === id) {
          if (item.danmu.bulletBtn.main.status !== 'paused') {
            item.startMove(pos, true)
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

  freezeComment(id) {
    this.logger && this.logger.info(`freezeComment: id ${id}`)
    this.mouseControl = true
    let pos = this.container.getBoundingClientRect()
    if (id) {
      this.bulletBtn.main.queue.some((item) => {
        if (item.id === id) {
          item.status = 'forcedPause'
          item.pauseMove(pos)
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
    if (!id) return
    this.bulletBtn.main.queue.some((item) => {
      if (item.id === id) {
        item.remove()
        return true
      } else {
        return false
      }
    })
    this.bulletBtn.main.data = this.bulletBtn.main.data.filter((item) => {
      return item.id !== id
    })
  }

  updateComments(comments, isClear = true) {
    if (isClear) {
      this.bulletBtn.main.data = []
    }
    this.bulletBtn.main.data = this.bulletBtn.main.data.concat(comments)
  }

  setAllDuration(mode = 'scroll', duration, force = true) {
    this.logger && this.logger.info(`setAllDuration: mode ${mode} duration ${duration} force ${force}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (duration) {
      duration = duration ? duration : 5000
      if (force) {
        this.bulletBtn.main.forceDuration = duration
      }
      this.bulletBtn.main.data.forEach((data) => {
        if (mode === data.mode) {
          data.duration = duration
        }
      })
      this.bulletBtn.main.queue.forEach((item) => {
        if (mode === item.mode) {
          item.duration = duration
          item.pauseMove(containerPos_)
          if (item.danmu.bulletBtn.main.status !== 'paused') {
            item.startMove(containerPos_)
          }
        }
      })
    }
  }

  setOpacity(opacity) {
    this.logger && this.logger.info(`setOpacity: opacity ${opacity}`)
    this.container.style.opacity = opacity
  }

  setFontSize(size, channelSize) {
    this.logger && this.logger.info(`setFontSize: size ${size} channelSize ${channelSize}`)
    this.fontSize = `${size}px`
    if (size) {
      this.bulletBtn.main.data.forEach((data) => {
        if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
      this.bulletBtn.main.queue.forEach((item) => {
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
      this.bulletBtn.main.channel.resize(true)
    }
  }

  setArea(area) {
    this.logger && this.logger.info(`setArea: area ${area}`)
    this.config.area = area
    this.bulletBtn.main.channel.resize(true)
  }

  hide(mode = 'scroll') {
    this.logger && this.logger.info(`hide: mode ${mode}`)
    if (this.hideArr.indexOf(mode) < 0) {
      this.hideArr.push(mode)
    }
    let arr = this.bulletBtn.main.queue.filter((item) => mode === item.mode || (mode === 'color' && item.color))
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
