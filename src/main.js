import Channel from './channel'
import Bullet from './bullet'
import util from './utils/util'

/**
 * [Main 弹幕主进程]
 * @type {Class}
 */
class Main {
  constructor (danmu) {
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
    danmu.on('bullet_remove', this.updateQueue.bind(this))
    let self = this
    this.danmu.on('changeDirection', direction => {
      self.danmu.direction = direction
    })
    this.nums = 0
  }
  // 在渲染队列中移除已经展示完的弹幕对象
  updateQueue (rdata) {
    let self = this
    self.queue.some((item, index) => {
      if (item.id === rdata.bullet.id) {
        self.queue.splice(index, 1)
        return true
      } else {
        return false
      }
    })
  }
  init (bol, self) {
    if (!self) {
      self = this
    }
    self.retryStatus = 'normal'
    self.data.sort((a, b) => a.start - b.start)
    let dataHandle = function () {
      self.readData()
      self.dataHandle()
      if (self.retryStatus !== 'stop') {
        setTimeout(function () {
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
    let self = this
    this.status = 'playing'
    this.queue = []
    this.container.innerHTML = ''
    this.channel.resetWithCb(self.init, self)
  }
  stop () {
    let self = this
    this.status = 'closed'
    self.retryTimer = null
    self.retryStatus = 'stop'
    self.channel.reset()
    this.queue = []
    self.container.innerHTML = ''
  }
  play () {
    this.status = 'playing'
    let channels = this.channel.channels
    let containerPos = this.danmu.container.getBoundingClientRect()
    if (channels && channels.length > 0) {
      ['scroll', 'top', 'bottom'].forEach( key => {
        for (let i = 0; i < channels.length; i++) {
          channels[i].queue[key].forEach(item => {
            if(!item.resized) {
              item.startMove(containerPos)
              item.resized = true
            }
          })
        }
        for (let i = 0; i < channels.length; i++) {
          channels[i].queue[key].forEach(item => {
            item.resized = false
          })
        }
      })
    }
  }
  pause () {
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
        if (item.status === 'waiting' || item.status === 'paused') {
          // item.status = 'start'
          item.startMove(self.channel.containerPos)
        }
      })
    }
  }
  readData () {
    let self = this, danmu = this.danmu
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
          item.duration = self.forceDuration;
        }
        bullet = new Bullet(danmu, item)
        if (!item.hasAttached) {
          bullet.attach()
          item.hasAttach = true
        }
        result = channel.addBullet(bullet)
        if (result.result) {
          self.queue.push(bullet)
          self.nums++;
          bullet.topInit()
        } else {
          bullet.detach()
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
