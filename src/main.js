import BaseClass from './baseClass'
import Channel from './channel'
import Bullet from './bullet'
import util from './utils/util'

/**
 * [Main 弹幕主进程]
 * @type {Class}
 */
class Main extends BaseClass {
  constructor (danmu) {
    super()
    this.setLogger('main')
    this.danmu = danmu
    this.container = danmu.container
    this.channel = new Channel(danmu)// 弹幕轨道实例
    this.data = [].concat(danmu.config.comments)
    this.playedData = []
    this.queue = []// 等待播放的弹幕队列
    this.timer = null// 弹幕动画定时器句柄
    this.retryTimer = null// 弹幕更新重试定时器句柄
    this.retryStatus = 'normal'
    this.interval = danmu.config.interval || 2000// 弹幕队列缓存间隔
    this.status = 'idle'// 当前弹幕正在闲置
    util.on(danmu, 'bullet_remove', this.updateQueue.bind(this), 'destroy')
    let self = this
    util.on(this.danmu, 'changeDirection', direction => {
      self.danmu.direction = direction
    }, 'destroy')
    this.nums = 0
  }
  destroy () {
    this.logger.info('destroy')
    clearTimeout(this.dataHandleTimer)
    this.channel.destroy()
    this.data = []
    for (let k in this) {
      delete this[k]
    }
  }
  // 在渲染队列中移除已经展示完的弹幕对象
  updateQueue (rdata) {
    this.logger.info('updateQueue')
    let self = this
    self.queue.some((item, index) => {
      if (item.id === rdata.bullet.id) {
        self.queue.splice(index, 1)
        return true
      } else {
        return false
      }
    })
    self.data.some((item, index) => {
      if (item.id === rdata.bullet.id) {
        item.hasAttached = false
        return true
      } else {
        return false
      }
    })
  }
  init (bol, self) {
    self.logger.info('init')
    if (!self) {
      self = this
    }
    self.retryStatus = 'normal'
    self.data.sort((a, b) => a.start - b.start)
    let dataHandle = function () {
      if (self.status === 'closed' && self.retryStatus === 'stop') {
        return
      }
      if (self.status === 'playing') {
        self.readData()
        self.dataHandle()
      }
      if (self.retryStatus !== 'stop' || self.status === 'paused') {
        self.dataHandleTimer = setTimeout(function () {
          dataHandle()
        }, self.interval - 1000)
      }
    }
    if (!self.retryTimer) {
      dataHandle()
    }
  }
  // 启动弹幕渲染主进程
  start () {
    this.logger.info('start')
    let self = this
    this.status = 'playing'
    this.queue = []
    this.container.innerHTML = ''
    this.channel.resetWithCb(self.init, self)
  }
  stop () {
    this.logger.info('stop')
    let self = this
    this.status = 'closed'
    self.retryTimer = null
    self.retryStatus = 'stop'
    self.channel.reset()
    this.queue = []
    self.container.innerHTML = ''
  }
  clear () {
    this.logger.info('clear')
    this.channel.reset()
    this.data = []
    this.queue = []
    this.container.innerHTML = ''
  }
  play () {
    this.logger.info('play')
    this.status = 'playing'
    let channels = this.channel.channels
    let containerPos = this.danmu.container.getBoundingClientRect()
    if (channels && channels.length > 0) {
      ['scroll', 'top', 'bottom'].forEach( key => {
        // for (let i = 0; i < channels.length; i++) {
        //   channels[i].queue[key].forEach(item => {
        //     if(!item.resized) {
        //       item.startMove(containerPos)
        //       item.resized = true
        //     }
        //   })
        // }
        this.queue.forEach(item => {
          item.startMove(containerPos)
          item.resized = true
        })
        for (let i = 0; i < channels.length; i++) {
          channels[i].queue[key].forEach(item => {
            item.resized = false
          })
        }
      })
    }
  }
  pause () {
    this.logger.info('pause')
    this.status = 'paused'
    let channels = this.channel.channels
    let containerPos = this.danmu.container.getBoundingClientRect()
    if (channels && channels.length > 0) {
      // ['scroll', 'top', 'bottom'].forEach( key => {
      //   for (let i = 0; i < channels.length; i++) {
      //     channels[i].queue[key].forEach(item => {
      //       item.pauseMove(containerPos)
      //     })
      //   }
      // })
      this.queue.forEach(item => {
        item.pauseMove(containerPos)
      })
    }
  }
  dataHandle () {
    let self = this
    if (this.status === 'paused' || this.status === 'closed') {
      return
    }
    if (self.queue.length) {
      self.queue.forEach(item => {
        if (item.status === 'waiting') {
          // item.status = 'start'
          item.startMove(self.channel.containerPos)
        }
      })
    }
  }
  readData () {
    let self = this, danmu = this.danmu
    if(!danmu.isReady) return
    let currentTime = 0
    if(danmu.player && danmu.player.currentTime) {
      currentTime = util.formatTime(danmu.player.currentTime)
    }
    let bullet, interval = self.interval, channel = self.channel, result
    let list
    if(danmu.player) {
      list = self.data.filter(item => {
        if (!item.start && self.danmu.hideArr.indexOf(item.mode) < 0) {
          if (!item.color || self.danmu.hideArr.indexOf('color') < 0) {
            item.start = currentTime
          }
        }
        return self.danmu.hideArr.indexOf(item.mode) < 0 && (!item.color || self.danmu.hideArr.indexOf('color') < 0) && item.start - interval <= currentTime && currentTime <= item.start + interval
      })
      if(danmu.live) {
        self.data = self.data.filter(item => {
          if (!item.start) {
            item.start = currentTime
          }
          return item.start > currentTime - 3 * interval
        })
      }
    } else {
      list = self.data.splice(0, 1)
      // self.data = []
      if(list.length === 0) list = self.playedData.splice(0, 1)
    }

    if (list.length > 0) {
      list.forEach(item => {
        if (self.forceDuration && self.forceDuration != item.duration) {
          item.duration = self.forceDuration
        }
        bullet = new Bullet(danmu, item)
        if (!item.hasAttached) {
          bullet.attach()
          item.hasAttached = true
          result = channel.addBullet(bullet)
          if (result.result) {
            self.queue.push(bullet)
            self.nums++
            bullet.topInit()
          } else {
            bullet.detach()
            for (let k in bullet) {
              delete bullet[k]
            }
            bullet = null
            item.hasAttached = false
            if(item.noDiscard) {
              if(item.prior) {
                self.data.unshift(item)
              } else {
                self.data.push(item)
              }
            }
          }
        } else {
          bullet.detach()
          for (let k in bullet) {
            delete bullet[k]
          }
          bullet = null
          item.hasAttached = false
          if(item.noDiscard) {
            if(item.prior) {
              self.data.unshift(item)
            } else {
              self.data.push(item)
            }
          }
        }
      })
    }
  }
}

export default Main
