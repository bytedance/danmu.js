import EventEmitter from 'event-emitter'
import BaseClass from './baseClass'
import Control from './control'
import RecyclableDomList from './domrecycle.js'
import util from './utils/util'
import { version } from '../version.json'
import {addObserver, unObserver} from './resizeObserver'

class DanmuJs extends BaseClass {
  constructor (options) {
    super()
    this.setLogger('danmu')
    this.logger.info(`danmu.js version: ${version}`)
    let self = this
    self.config = util.deepCopy({
      overlap: false,
      area: {
        start: 0,
        end: 1
      },
      live: false,
      comments: [],
      direction: 'r2l',
      needResizeObserver: false
    }, options)
    self.hideArr = []
    self.domObj = new RecyclableDomList()
    EventEmitter(self)
    self.config.comments.forEach(comment => {
      comment.duration = comment.duration ? comment.duration : 5000
      if(!comment.mode) {
        comment.mode = 'scroll'
      }
    })
    if(self.config.container && self.config.container.nodeType === 1) {
      self.container = self.config.container
    } else {
      self.emit('error', 'container id can\'t be empty')
      return false
    }
    if(self.config.containerStyle) {
      let style = self.config.containerStyle
      Object.keys(style).forEach(function (key) {
        self.container.style[key] = style[key]
      })
    }
    self.live = self.config.live
    self.player = self.config.player
    self.direction = self.config.direction
    util.addClass(self.container, 'danmu')
    self.bulletBtn = new Control(self)
    self.isReady = true
    self.emit('ready')
    this.logger.info('ready')
    this.addResizeObserver()
  }

  addResizeObserver () {
    this.config.needResizeObserver && addObserver(this.container, () => {
      this.logger.info('needResizeObserver')
      this.resize()
    })
  }
  
  start () {
    this.logger.info('start')
    this.bulletBtn.main.start()
  }

  pause () {
    this.logger.info('pause')
    this.bulletBtn.main.pause()
  }

  play () {
    this.logger.info('play')
    this.bulletBtn.main.play()
  }

  stop () {
    this.logger.info('stop')
    this.bulletBtn.main.stop()
  }

  clear () {
    this.logger.info('clear')
    this.bulletBtn.main.clear()
  }

  destroy () {
    unObserver(this.container)
    this.logger.info('destroy')
    this.stop()
    this.bulletBtn.destroy()
    this.domObj.destroy()
    for (let k in this) {
      delete this[k]
    }
    this.emit('destroy')
  }

  sendComment (comment) {
    this.logger.info(`sendComment: ${comment.txt || '[DOM Element]'}`)
    if(!comment.duration) {
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
        if (this.like) {
          comment.like = comment.like ? comment.like : this.like
        }
      }
      if(comment.prior || comment.realTime) {
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

  setCommentID (oldID, newID) {
    this.logger.info(`setCommentID: oldID ${oldID} newID ${newID}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (oldID && newID) {
      this.bulletBtn.main.data.some(data => {
        if(data.id === oldID) {
          data.id = newID
          return true
        } else {
          return false
        }
      })
      this.bulletBtn.main.queue.some(item => {
        if(item.id === oldID) {
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

  setCommentDuration (id, duration) {
    this.logger.info(`setCommentDuration: id ${id} duration ${duration}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (id && duration) {
      duration = duration ? duration : 5000
      this.bulletBtn.main.data.some(data => {
        if(data.id === id) {
          data.duration = duration
          return true
        } else {
          return false
        }
      })
      this.bulletBtn.main.queue.some(item => {
        if(item.id === id) {
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

  setCommentLike (id, like) {
    this.logger.info(`setCommentLike: id ${id} like ${like}`)
    let containerPos_ = this.container.getBoundingClientRect()
    this.like = like
    if (id && like) {
      this.bulletBtn.main.data.some(data => {
        if(data.id === id) {
          data.like = like
          return true
        } else {
          return false
        }
      })
      this.bulletBtn.main.queue.some(item => {
        if(item.id === id) {
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

  restartComment (id) {
    this.logger.info(`restartComment: id ${id}`)
    this.mouseControl = false
    let pos = this.container.getBoundingClientRect()
    if (id) {
      this.bulletBtn.main.queue.some(item => {
        if(item.id === id) {
          if (item.danmu.bulletBtn.main.status !== 'paused') {
            item.startMove(pos, true)
          }
          else {
            item.status = 'paused'
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  freezeComment (id) {
    this.logger.info(`freezeComment: id ${id}`)
    this.mouseControl = true
    let pos = this.container.getBoundingClientRect()
    if (id) {
      this.bulletBtn.main.queue.some(item => {
        if(item.id === id) {
          item.status = 'forcedPause'
          item.pauseMove(pos)
          if (item.el && item.el.style) {
            util.style(item.el, 'zIndex', 10)
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  removeComment (id) {
    this.logger.info(`removeComment: id ${id}`)
    if (!id) return
    this.bulletBtn.main.queue.some(item => {
      if(item.id === id) {
        item.remove()
        return true
      } else {
        return false
      }
    })
    this.bulletBtn.main.data = this.bulletBtn.main.data.filter(item => {
      return item.id !== id
    })
  }

  setAllDuration (mode = 'scroll', duration, force = true) {
    this.logger.info(`setAllDuration: mode ${mode} duration ${duration} force ${force}`)
    let containerPos_ = this.container.getBoundingClientRect()
    if (duration) {
      duration = duration ? duration : 5000
      if (force) {
        this.bulletBtn.main.forceDuration = duration
      }
      this.bulletBtn.main.data.forEach(data => {
        if(mode === data.mode) {
          data.duration = duration
        }
      })
      this.bulletBtn.main.queue.forEach(item => {
        if(mode === item.mode) {
          item.duration = duration
          item.pauseMove(containerPos_)
          if (item.danmu.bulletBtn.main.status !== 'paused') {
            item.startMove(containerPos_)
          }
        }
      })
    }
  }

  setOpacity (opacity) {
    this.logger.info(`setOpacity: opacity ${opacity}`)
    this.container.style.opacity = opacity
  }
  
  setFontSize (size, channelSize) {
    this.logger.info(`setFontSize: size ${size} channelSize ${channelSize}`)
    this.fontSize = `${size}px`
    if (size) {
      this.bulletBtn.main.data.forEach(data => {
        if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
      this.bulletBtn.main.queue.forEach(item => {
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
  
  setArea (area) {
    this.logger.info(`setArea: area ${area}`)
    this.config.area = area
    this.bulletBtn.main.channel.resize(true)
  }

  hide (mode = 'scroll') {
    this.logger.info(`hide: mode ${mode}`)
    if(this.hideArr.indexOf(mode) < 0) {
      this.hideArr.push(mode)
    }
    let arr = this.bulletBtn.main.queue.filter(item => mode === item.mode || (mode === 'color' && item.color))
    arr.forEach(item => item.remove())
  }

  show (mode = 'scroll') {
    this.logger.info(`show: mode ${mode}`)
    let index = this.hideArr.indexOf(mode)
    if(index > -1) {
      this.hideArr.splice(index, 1)
    }
  }

  setDirection (direction = 'r2l') {
    this.logger.info(`setDirection: direction ${direction}`)
    this.emit('changeDirection', direction)
  }

  resize () {
    this.logger.info('resize')
    this.emit('channel_resize')
  }
}

export default DanmuJs
