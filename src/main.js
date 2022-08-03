import BaseClass from './baseClass'
import Bullet from './bullet'
import Channel from './channel'
import { attachEventListener } from './utils/util'

/**
 * @typedef {{
 *  id: string
 *  start: number
 *  duration: number
 *  prior: boolean
 *  txt: string
 *  mode: 'scroll' | 'top' | 'bottom'
 *  _attached: boolean // 内部属性，标记弹幕是否已经被入轨
 * }} CommentData
 */

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

    /**
     * @type {Array<CommentData>}
     */
    this.data = [].concat(danmu.config.comments)
    this.playedData = []

    /**
     * @type {Array<Bullet>}
     */
    this.queue = [] // 等待播放的弹幕队列
    this.timer = null // 弹幕动画定时器句柄

    /**
     * @type {'normal'|'stop'}
     */
    this.retryStatus = 'normal'
    this.interval = danmu.config.interval // 弹幕队列缓存间隔
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
        item._attached = false
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

    self.sortData()

    function dataHandle() {
      if (self.dataHandleTimer) {
        clearTimeout(self.dataHandleTimer)
        self.dataHandleTimer = null
      }
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
    dataHandle()
  }
  // 启动弹幕渲染主进程
  start() {
    this.logger && this.logger.info('start')
    const self = this
    self._status = 'playing'
    self.queue = []
    self.container.innerHTML = ''
    self.channel.reset()
    self.init()
  }
  stop() {
    this.logger && this.logger.info('stop')
    const self = this
    self._status = 'closed'
    self.retryStatus = 'stop'
    self.queue = []
    self.container.innerHTML = ''
    self.channel.reset()
  }
  clear() {
    this.logger && this.logger.info('clear')
    this.channel.reset()
    this.data = []
    this.queue = []
    this.container.innerHTML = ''
  }
  play() {
    if (this._status === 'closed') {
      this.logger && this.logger.info('play ignored')
      return
    }

    this.logger && this.logger.info('play')
    this._status = 'playing'
    let channels = this.channel.channels
    if (channels && channels.length > 0) {
      // eslint-disable-next-line no-extra-semi
      ;['scroll', 'top', 'bottom'].forEach((key) => {
        // for (let i = 0; i < channels.length; i++) {
        //   channels[i].queue[key].forEach(item => {
        //     if(!item.resized) {
        //       item.startMove()
        //       item.resized = true
        //     }
        //   })
        // }
        this.queue.forEach((item) => {
          item.startMove()
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
    if (this._status === 'closed') {
      this.logger && this.logger.info('pause ignored')
      return
    }

    this.logger && this.logger.info('pause')
    this._status = 'paused'
    let channels = this.channel.channels
    if (channels && channels.length > 0) {
      // ['scroll', 'top', 'bottom'].forEach( key => {
      //   for (let i = 0; i < channels.length; i++) {
      //     channels[i].queue[key].forEach(item => {
      //       item.pauseMove()
      //     })
      //   }
      // })
      this.queue.forEach((item) => {
        item.pauseMove()
      })
    }
  }
  dataHandle() {
    const self = this
    if (this._status === 'paused' || this._status === 'closed') {
      return
    }
    if (self.queue.length) {
      self.queue.forEach((item) => {
        if (item.status === 'waiting') {
          item.startMove()
        }
      })
    }
  }
  readData() {
    if (!this.danmu.isReady) return

    const self = this,
      danmu = this.danmu,
      player = danmu.player,
      interval = self.interval,
      channel = self.channel
    let result,
      /**
       * @type {Bullet}
       */
      bullet,
      /**
       * @type {Array<CommentData>}
       */
      list

    if (player) {
      const currentTime = player.currentTime ? Math.floor(player.currentTime * 1000) : 0

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
      if (list.length === 0) list = self.playedData.splice(0, 1)
    }

    if (list.length > 0) {
      // 提前更新轨道位置信息, 减少Bullet频繁读取容器dom信息
      channel.updatePos()

      list.forEach((item) => {
        if (self.forceDuration && self.forceDuration != item.duration) {
          item.duration = self.forceDuration
        }
        bullet = new Bullet(danmu, item)
        if (bullet && !bullet.bulletCreateFail) {
          if (!item._attached) {
            bullet.attach()
            item._attached = true
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
              item._attached = false
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
            item._attached = false
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
  sortData() {
    this.data.sort((prev, cur) => (prev.start || -1) - (cur.start || -1))
  }
}

export default Main
