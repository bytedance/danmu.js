import BaseClass from './baseClass'
import Bullet from './bullet'
import Channel from './channel'
import { attachEventListener, formatTime } from './utils/util'

/**
 * [Main 弹幕主进程]
 * @type {Class}
 */
class Main extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu) {
    super()
    this.setLogger('main')
    this.danmu = danmu
    this.container = danmu.container
    this.channel = new Channel(danmu) // 弹幕轨道实例
    this.data = [].concat(danmu.config.comments)
    this.playedData = []

    /**
     * @type {Array<Bullet>}
     */
    this.queue = [] // 等待播放的弹幕队列
    this.timer = null // 弹幕动画定时器句柄
    this.retryTimer = null // 弹幕更新重试定时器句柄
    this.retryStatus = 'normal'
    this.interval = danmu.config.interval || 2000 // 弹幕队列缓存间隔
    /**
     * @type {Array<string>}
     */
    this.willChanges = []
    /**
     * @type {'idle' | 'paused' | 'playing' | 'closed'}
     */
    this._status = 'idle' // 当前弹幕正在闲置

    attachEventListener(danmu, 'bullet_remove', this.updateQueue.bind(this), 'destroy')
    attachEventListener(
      danmu,
      'changeDirection',
      (direction) => {
        this.danmu.direction = direction
      },
      'destroy'
    )
    this.nums = 0
  }

  get status() {
    return this._status
  }

  destroy() {
    this.logger && this.logger.info('destroy')
    clearTimeout(this.dataHandleTimer)
    this.channel.destroy()
    this.data = []
    for (let k in this) {
      delete this[k]
    }
  }
  // 在渲染队列中移除已经展示完的弹幕对象
  updateQueue(rdata) {
    this.logger && this.logger.info('updateQueue')
    let self = this
    self.queue.some((item, index) => {
      if (item.id === rdata.bullet.id) {
        self.queue.splice(index, 1)
        return true
      } else {
        return false
      }
    })
    self.data.some((item) => {
      if (item.id === rdata.bullet.id) {
        item.hasAttached = false
        return true
      } else {
        return false
      }
    })
  }
  init() {
    const self = this
    self.logger && self.logger.info('init')
    self.retryStatus = 'normal'
    self.data.sort((a, b) => a.start - b.start)

    let dataHandle = function () {
      if (self._status === 'closed' && self.retryStatus === 'stop') {
        return
      }
      if (self._status === 'playing') {
        self.readData()
        self.dataHandle()
      }
      if (self.retryStatus !== 'stop' || self._status === 'paused') {
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
  start() {
    this.logger && this.logger.info('start')
    const self = this
    self._status = 'playing'
    self.queue = []
    self.container.innerHTML = ''
    // this.channel.resetWithCb(self.init, self)
    self.channel.reset()
    self.init()
  }
  stop() {
    this.logger && this.logger.info('stop')
    const self = this
    self._status = 'closed'
    self.retryTimer = null
    self.retryStatus = 'stop'
    self.channel.reset()
    self.queue = []
    self.container.innerHTML = ''
  }
  clear() {
    this.logger && this.logger.info('clear')
    this.channel.reset()
    this.data = []
    this.queue = []
    this.container.innerHTML = ''
  }
  play() {
    this.logger && this.logger.info('play')
    this._status = 'playing'
    let channels = this.channel.channels
    let containerPos = this.danmu.container.getBoundingClientRect()
    if (channels && channels.length > 0) {
      // eslint-disable-next-line no-extra-semi
      ;['scroll', 'top', 'bottom'].forEach((key) => {
        // for (let i = 0; i < channels.length; i++) {
        //   channels[i].queue[key].forEach(item => {
        //     if(!item.resized) {
        //       item.startMove(containerPos)
        //       item.resized = true
        //     }
        //   })
        // }
        this.queue.forEach((item) => {
          item.startMove(containerPos)
          item.resized = true
        })
        for (let i = 0; i < channels.length; i++) {
          channels[i].queue[key].forEach((item) => {
            item.resized = false
          })
        }
      })
    }
  }
  pause() {
    this.logger && this.logger.info('pause')
    this._status = 'paused'
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
      this.queue.forEach((item) => {
        item.pauseMove(containerPos)
      })
    }
  }
  dataHandle() {
    let self = this
    if (this._status === 'paused' || this._status === 'closed') {
      return
    }
    if (self.queue.length) {
      self.queue.forEach((item) => {
        if (item.status === 'waiting') {
          item.startMove(self.channel.containerPos)
        }
      })
    }
  }
  readData() {
    let self = this,
      danmu = this.danmu
    if (!danmu.isReady) return
    let currentTime = 0
    if (danmu.player && danmu.player.currentTime) {
      currentTime = formatTime(danmu.player.currentTime)
    }
    let bullet,
      interval = self.interval,
      channel = self.channel,
      result
    let list
    if (danmu.player) {
      list = self.data.filter((item) => {
        if (!item.start && self.danmu.hideArr.indexOf(item.mode) < 0) {
          if (!item.color || self.danmu.hideArr.indexOf('color') < 0) {
            item.start = currentTime
          }
        }
        return (
          self.danmu.hideArr.indexOf(item.mode) < 0 &&
          (!item.color || self.danmu.hideArr.indexOf('color') < 0) &&
          item.start - interval <= currentTime &&
          currentTime <= item.start + interval
        )
      })
      if (danmu.live) {
        self.data = []
      }
    } else {
      list = self.data.splice(0, 1)
      // self.data = []
      if (list.length === 0) list = self.playedData.splice(0, 1)
    }

    if (list.length > 0) {
      list.forEach((item) => {
        if (self.forceDuration && self.forceDuration != item.duration) {
          item.duration = self.forceDuration
        }
        bullet = new Bullet(danmu, item)
        if (bullet && !bullet.bulletCreateFail) {
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
              if (item.noDiscard) {
                if (item.prior) {
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
            if (item.noDiscard) {
              if (item.prior) {
                self.data.unshift(item)
              } else {
                self.data.push(item)
              }
            }
          }
        }
      })
    }
  }
}

export default Main
