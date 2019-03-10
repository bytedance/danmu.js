import EventEmitter from 'event-emitter'
import Control from './control'
import util from './utils/util'

class DanmuJs {
  constructor (options) {
    this.config = util.deepCopy({
      overlap: false,
      area: {
        start: 0,
        end: 1
      },
      comments: [],
      direction: 'r2l'
    }, options)
    this.hideArr = []
    EventEmitter(this)
    let self = this
    this.config.comments.forEach(comment => {
      comment.duration = comment.duration < 5000 ? 5000 : comment.duration
      if(!comment.mode) {
        comment.mode = 'scroll'
      }
    })
    if(this.config.container && this.config.container.nodeType === 1) {
      this.container = this.config.container
    } else {
      this.emit('error', 'container id can\'t be empty')
      return false
    }
    if(this.config.containerStyle) {
      let style = this.config.containerStyle
      Object.keys(style).forEach(function (key) {
        self.container.style[key] = style[key]
      })
    }
    this.player = this.config.player
    this.direction = this.config.direction
    util.addClass(this.container, 'danmu')
    this.bulletBtn = new Control(this);
    ['touchend', 'click', 'dblclick'].forEach(item => {
      this.container.addEventListener(item, function (e) {
        e.preventDefault()
        e.stopPropagation()
        if(self.player) {
          // self.player.focus()
          // if (util.hasClass(root, 'xgplayer-inactive')) {
          //   self.player.emit('focus')
          // } else {
          //   self.player.emit('blur')
          // }
          let clk
          if (document.createEvent) {
            clk = document.createEvent('Event')
            clk.initEvent(item, true, true)
          } else {
            clk = new Event(item)
          }
          self.player.dispatchEvent(clk)
        }
      }, false)
    })
    this.emit('ready')
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
    if (comment && comment.id && comment.duration && (comment.el || comment.txt)) {
      comment.duration = comment.duration < 5000 ? 5000 : comment.duration
      this.bulletBtn.main.data.push(comment)
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
