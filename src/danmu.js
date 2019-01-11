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
      comments: []
    }, options)
    EventEmitter(this)
    let self = this
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
    if(this.config.player) {
      this.player = this.config.player
    } else {
      this.emit('error', 'player can\'t be empty')
      return false
    }
    util.addClass(this.container, 'danmu')
    this.bulletBtn = new Control(this);
    ['touchend', 'click', 'dblclick'].forEach(item => {
      this.container.addEventListener(item, function () {
        if(self.player) {
          self.player.focus()
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
    if (comment && comment.id && comment.duration && comment.start && (comment.el || comment.txt)) {
      this.bulletBtn.main.data.push(comment)
    }
  }
}

export default DanmuJs
