import EventEmitter from 'event-emitter'
import Control from './control'
import util from './utils/util'

class DanmuJs {
  constructor (options) {
    let self = this
    self.config = util.deepCopy({
      overlap: false,
      area: {
        start: 0,
        end: 1
      },
      live: false,
      comments: [],
      direction: 'r2l'
    }, options)
    self.hideArr = []
    EventEmitter(self)
    self.config.comments.forEach(comment => {
      comment.duration = comment.duration < 5000 ? 5000 : comment.duration
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
    self.emit('ready')
  }

  start () {
    this.bulletBtn.main.start()
  }

  pause () {
    this.bulletBtn.main.pause()
  }

  play () {
    this.bulletBtn.main.play()
  }

  stop () {
    this.bulletBtn.main.stop()
  }

  sendComment (comment) {
    if(!comment.duration) {
      comment.duration = 15000
    }
    if (comment && comment.id && comment.duration && (comment.el || comment.txt)) {
      comment.duration = comment.duration < 5000 ? 5000 : comment.duration
      if (comment.style) {
        if (this.opacity !== comment.style.opacity) {
          comment.style.opacity = this.opacity
        }
        if (this.fontSize !== comment.style.fontSize) {
          comment.style.fontSize = this.fontSize
        }
        if (this.like) {
          comment.like = comment.like ? comment.like : this.like
        }
      }
      if(comment.prior) {
        this.bulletBtn.main.data.unshift(comment)
      } else {
        this.bulletBtn.main.data.push(comment)
      }
    }
  }

  setCommentID (oldID, newID) {
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
          item.startMove(containerPos_)
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentDuration (id, duration) {
    let containerPos_ = this.container.getBoundingClientRect()
    if (id && duration) {
      duration = duration < 5000 ? 5000 : duration
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
          item.startMove(containerPos_)
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentLike (id, like) {
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
          item.startMove(containerPos_)
          return true
        } else {
          return false
        }
      })
    }
  }

  startCommentMove (id) {
    let containerPos_ = this.container.getBoundingClientRect()
    if (id) {
      this.bulletBtn.main.queue.some(item => {
        if(item.id === id) {
          item.startMove(containerPos_)
          return true
        } else {
          return false
        }
      })
    }
  }

  setAllDuration (mode = 'scroll', duration) {
    let containerPos_ = this.container.getBoundingClientRect()
    if (duration) {
      duration = duration < 5000 ? 5000 : duration
      this.bulletBtn.main.data.forEach(data => {
        if(mode === data.mode) {
          data.duration = duration
        }
      })
      this.bulletBtn.main.queue.forEach(item => {
        if(mode === item.mode) {
          item.duration = duration
          item.pauseMove(containerPos_)
          item.startMove(containerPos_)
        }
      })
    }
  }

  setOpacity (opacity) {
    let pos = this.container.getBoundingClientRect()
    this.opacity = opacity
    if (opacity) {
      this.bulletBtn.main.data.forEach(data => {
        if (data.style) {
          data.style.opacity = opacity
        }
      })
      this.bulletBtn.main.queue.forEach(item => {
        item.pauseMove(pos)
        item.setOpacity(opacity)
        item.startMove(pos)
      })
    }
  }
  
  setFontSize (size) {
    this.fontSize = `${size}px`
    if (size) {
      this.bulletBtn.main.data.forEach(data => {
        if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
    }
  }

  hide (mode = 'scroll') {
    if(this.hideArr.indexOf(mode) < 0) {
      this.hideArr.push(mode)
    }
    let arr = this.bulletBtn.main.queue.filter(item => mode === item.mode || (mode === 'color' && item.color))
    arr.forEach(item => item.remove())
  }

  show (mode = 'scroll') {
    let index = this.hideArr.indexOf(mode)
    if(index > -1) {
      this.hideArr.splice(index, 1)
    }
  }

  setDirection (direction = 'r2l') {
    this.emit('changeDirection', direction)
  }
}

export default DanmuJs
