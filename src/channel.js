import BaseClass from './baseClass'
import { attachEventListener, hasOwnProperty, isNumber } from './utils/util'
import { validAreaLineRule } from './utils/validator'

/**
 * [Channel 弹幕轨道控制]
 */
class Channel extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu) {
    super()
    const self = this

    self.setLogger('channel')
    self.danmu = danmu
    self.width = 0
    self.height = 0
    self.reset(true)
    self.channels = []
    self.updatePos()

    attachEventListener(
      this.danmu,
      'bullet_remove',
      (r) => {
        self.removeBullet(r.bullet)
      },
      'destroy'
    )
    attachEventListener(
      this.danmu,
      'channel_resize',
      () => {
        self.resize()
      },
      'destroy'
    )
  }

  get direction() {
    return this.danmu.direction
  }

  destroy() {
    this.logger && this.logger.info('destroy')
    this.channels.splice(0, this.channels.length)
    this._cancelResizeTimer()

    // clear prop at end
    for (const k in this) {
      if (hasOwnProperty.call(this, k)) {
        delete this[k]
      }
    }
  }

  reset(isInit = false) {
    this.logger && this.logger.info('reset')
    const self = this
    const { container, bulletBtn } = self.danmu

    self.container = container

    // bullet on waiting room
    if (bulletBtn && bulletBtn.main) {
      bulletBtn.main.queue.forEach((item) => {
        item.remove()
      })
    }
    // bullet on track
    if (self.channels && self.channels.length > 0) {
      // eslint-disable-next-line no-extra-semi
      ;['scroll', 'top', 'bottom'].forEach((key) => {
        for (let i = 0; i < self.channels.length; i++) {
          self.channels[i].queue[key].forEach((item) => {
            item.remove()
          })
        }
      })
    }
    if (bulletBtn && bulletBtn.main && bulletBtn.main.data) {
      bulletBtn.main.data.forEach((item) => {
        item.attached_ = false
      })
    }

    function channelReset() {
      let size = container.getBoundingClientRect()
      self.width = size.width
      self.height = size.height

      if (self.resetId) {
        cancelAnimationFrame(self.resetId)
        self.resetId = null
      }

      const { channelSize, channelCount, channels } = self._initChannels()

      self.channelCount = channelCount
      self.channels = channels
      if (self.direction === 'b2t') {
        self.channelWidth = channelSize
      } else {
        self.channelHeight = channelSize
      }
    }

    if (isInit) {
      this.resetId = requestAnimationFrame(channelReset)
    } else {
      channelReset()
    }
  }

  getRealOccupyArea() {
    return {
      width: this.width,
      height: this.height
    }
  }

  updatePos() {
    const pos = this.container.getBoundingClientRect()

    this.containerPos = pos
    this.containerWidth = pos.width
    this.containerHeight = pos.height
    this.containerTop = pos.top
    this.containerBottom = pos.bottom
    this.containerLeft = pos.left
    this.containerRight = pos.right
  }

  /**
   * Feature:
   * 1. 长弹幕速度较快，更容易出现追击问题，需要调整Offset
   * 2. 需要按实时性RealTime展示的弹幕，则不能再用duration来计算速度，这样会产生追击重叠问题
   *
   * @param {import('./bullet').Bullet} bullet
   */
  addBullet(bullet) {
    // this.logger && this.logger.info(`addBullet ${bullet.options.txt || '[DOM Element]'}`)
    const self = this
    const danmu = this.danmu
    const channels = this.channels
    let channelHeight, channelWidth, occupy

    if (self.direction === 'b2t') {
      channelWidth = this.channelWidth
      occupy = Math.ceil(bullet.width / channelWidth)
    } else {
      channelHeight = this.channelHeight
      occupy = Math.ceil(bullet.height / channelHeight)
    }
    if (occupy > channels.length) {
      return {
        result: false,
        message: `exceed channels.length, occupy=${occupy},channelsSize=${channels.length}`
      }
    } else {
      let flag = true,
        channel,
        pos = -1
      for (let i = 0, max = channels.length; i < max; i++) {
        if (channels[i].queue[bullet.mode].some((item) => item.id === bullet.id)) {
          return {
            result: false,
            message: `exited, channelOrder=${i},danmu_id=${bullet.id}`
          }
        }
      }
      if (bullet.mode === 'scroll') {
        for (let i = 0, max = channels.length - occupy; i <= max; i++) {
          flag = true
          for (let j = i; j < i + occupy; j++) {
            channel = channels[j]
            if (channel.operating.scroll) {
              flag = false
              break
            }
            if (channel.bookId.scroll && channel.bookId.scroll !== bullet.id) {
              flag = false
              break
            }
            channel.operating.scroll = true

            // 当前轨道 - 最后入轨弹幕
            const curBullet = channel.queue.scroll[0]

            if (curBullet) {
              const curBulletPos = curBullet.el.getBoundingClientRect()

              // 1. 检测最后入轨弹幕是否已经完全飘入容器区域
              if (self.direction === 'b2t') {
                if (curBulletPos.bottom >= self.containerPos.bottom) {
                  flag = false
                  channel.operating.scroll = false
                  break
                }
              } else {
                if (curBulletPos.right >= self.containerPos.right) {
                  flag = false
                  channel.operating.scroll = false
                  break
                }
              }

              let curS,
                curV = curBullet.moveV,
                curT,
                newV = bullet.moveV,
                catchS
              if (self.direction === 'b2t') {
                curS = curBulletPos.bottom - self.containerTop
                curT = curS / curV

                catchS = self.containerHeight + bullet.random - curS
              } else {
                curS = curBulletPos.right - self.containerLeft
                curT = curS / curV

                catchS = self.containerWidth + bullet.random - curS
              }

              // 2. 当前轨道内，新弹幕速度大于最后一个入轨弹幕速度，考虑碰撞问题
              if (newV > curV) {
                let catchT = catchS / (newV - curV)

                if (!danmu.config.bOffset) {
                  danmu.config.bOffset = 0
                }

                // 3. 相遇时间小于最后弹幕飘出时间
                if (curT + danmu.config.bOffset >= catchT) {
                  // 根据前一个弹幕剩余飘出时间，计算新弹幕需要增加的offset
                  const offset = curT * newV - self.containerPos.width
                  if (offset > 0) {
                    bullet.updateOffset(offset + (1 + Math.ceil(5 * Math.random())) /* 防止最后过于接近 */)
                  }
                }
              }
            }
            channel.operating.scroll = false
          }
          if (flag) {
            pos = i
            break
          }
        }
      } else if (bullet.mode === 'top') {
        for (let i = 0, max = channels.length - occupy; i <= max; i++) {
          flag = true
          for (let j = i; j < i + occupy; j++) {
            if (j > Math.floor(channels.length / 2)) {
              flag = false
              break
            }
            channel = channels[j]
            if (channel.operating[bullet.mode]) {
              flag = false
              break
            }
            if ((channel.bookId[bullet.mode] || bullet.prior) && channel.bookId[bullet.mode] !== bullet.id) {
              flag = false
              break
            }
            channel.operating[bullet.mode] = true
            if (channel.queue[bullet.mode].length > 0) {
              flag = false
              channel.operating[bullet.mode] = false
              break
            }
            channel.operating[bullet.mode] = false
          }
          if (flag) {
            pos = i
            break
          }
        }
      } else if (bullet.mode === 'bottom') {
        for (let i = channels.length - occupy; i >= 0; i--) {
          flag = true
          for (let j = i; j < i + occupy; j++) {
            if (j <= Math.floor(channels.length / 2)) {
              flag = false
              break
            }
            channel = channels[j]
            if (channel.operating[bullet.mode]) {
              flag = false
              break
            }
            if ((channel.bookId[bullet.mode] || bullet.prior) && channel.bookId[bullet.mode] !== bullet.id) {
              flag = false
              break
            }
            channel.operating[bullet.mode] = true
            if (channel.queue[bullet.mode].length > 0) {
              flag = false
              channel.operating[bullet.mode] = false
              break
            }
            channel.operating[bullet.mode] = false
          }
          if (flag) {
            pos = i
            break
          }
        }
      }

      if (pos !== -1) {
        for (let i = pos, max = pos + occupy; i < max; i++) {
          channel = channels[i]
          channel.operating[bullet.mode] = true
          channel.queue[bullet.mode].unshift(bullet)
          if (bullet.prior) {
            delete channel.bookId[bullet.mode]
            self.logger && self.logger.info(i + '号轨道恢复正常使用')
          }
          channel.operating[bullet.mode] = false
        }
        if (bullet.prior) {
          self.logger && self.logger.info(bullet.id + '号优先弹幕运行完毕')
          delete bullet['bookChannelId']
          if (danmu.player) {
            let dataList = danmu.bulletBtn.main.data
            dataList.some(function (item) {
              if (item.id === bullet.id) {
                delete item['bookChannelId']
                return true
              } else {
                return false
              }
            })
          }
        }
        bullet.channel_id = [pos, occupy]
        bullet.el.setAttribute('data-line-index', pos + 1)

        if (self.direction === 'b2t') {
          bullet.top = pos * channelWidth
          if (self.danmu.config.area && self.danmu.config.area.start) {
            bullet.top += self.containerWidth * self.danmu.config.area.start
          }
        } else {
          bullet.top = pos * channelHeight
          if (self.danmu.config.area && self.danmu.config.area.start) {
            bullet.top += self.containerHeight * self.danmu.config.area.start
          }
        }
        return {
          result: bullet,
          message: 'success'
        }
      } else {
        if (bullet.options.realTime) {
          // 找到应该被删的 danmu
          let start = 0
          let deleteIndex = -1
          let deleteItem = null
          self.danmu.bulletBtn.main.queue.forEach((item, index) => {
            if (
              !item.prior &&
              !item.options.realTime &&
              item.el &&
              item.el.getBoundingClientRect().left > self.containerPos.right &&
              item.start >= start
            ) {
              start = item.start
              deleteIndex = index
              deleteItem = item
            }
          })
          if (deleteItem) {
            deleteItem.remove()
            self.removeBullet(deleteItem)
            self.danmu.bulletBtn.main.queue.splice(deleteIndex, 1)
            bullet.channel_id = deleteItem.channel_id
            for (
              let i = deleteItem.channel_id[0], max = deleteItem.channel_id[0] + deleteItem.channel_id[1];
              i < max;
              i++
            ) {
              channel = channels[i]
              channel.operating[bullet.mode] = true
              channel.queue[bullet.mode].unshift(bullet)
              if (bullet.prior) {
                delete channel.bookId[bullet.mode]
              }
              channel.operating[bullet.mode] = false
            }
            bullet.top = deleteItem.top
            if (self.danmu.config.area && self.danmu.config.area.start) {
              bullet.top += self.containerHeight * self.danmu.config.area.start
            }
            return {
              result: bullet,
              message: 'success'
            }
          }
        }

        if (bullet.prior) {
          if (!bullet.bookChannelId && !self.danmu.live) {
            pos = -1
            for (let i = 0, max = channels.length - occupy; i <= max; i++) {
              flag = true
              for (let j = i; j < i + occupy; j++) {
                if (channels[j].bookId[bullet.mode]) {
                  flag = false
                  break
                }
              }
              if (flag) {
                pos = i
                break
              }
            }
            if (pos !== -1) {
              for (let j = pos; j < pos + occupy; j++) {
                channels[j].bookId[bullet.mode] = bullet.id
                self.logger && self.logger.info(j + '号轨道被' + bullet.id + '号优先弹幕预定')
              }
              let nextAddTime = 2
              if (danmu.player) {
                let dataList = danmu.bulletBtn.main.data
                dataList.some(function (item) {
                  if (item.id === bullet.id) {
                    self.logger && self.logger.info(bullet.id + '号优先弹幕将于' + nextAddTime + '秒后再次请求注册')
                    item.start += nextAddTime * 1000
                    item.bookChannelId = [pos, occupy]
                    self.logger && self.logger.info(`${bullet.id}号优先弹幕预定了${pos}~${pos + occupy - 1}号轨道`)
                    return true
                  } else {
                    return false
                  }
                })
              }
            }
          } else {
            let nextAddTime = 2
            if (danmu.player) {
              let dataList = danmu.bulletBtn.main.data
              dataList.some(function (item) {
                if (item.id === bullet.id) {
                  self.logger && self.logger.info(bullet.id + '号优先弹幕将于' + nextAddTime + '秒后再次请求注册')
                  item.start += nextAddTime * 1000
                  return true
                } else {
                  return false
                }
              })
            }
          }
        }

        return {
          result: false,
          message: 'no surplus will right'
        }
      }
    }
  }
  removeBullet(bullet) {
    this.logger && this.logger.info(`removeBullet ${bullet.options.txt || '[DOM Element]'}`)

    let channels = this.channels
    let channelId = bullet.channel_id
    let channel
    for (let i = channelId[0], max = channelId[0] + channelId[1]; i < max; i++) {
      channel = channels[i]
      if (channel) {
        channel.operating[bullet.mode] = true
        let i = -1
        channel.queue[bullet.mode].some((item, index) => {
          if (item.id === bullet.id) {
            i = index
            return true
          } else {
            return false
          }
        })
        if (i > -1) {
          channel.queue[bullet.mode].splice(i, 1)
        }
        channel.operating[bullet.mode] = false
      }
    }
    if (bullet.options.loop) {
      this.danmu.bulletBtn.main.playedData.push(bullet.options)
    }
  }

  resizeSync() {
    this.resize(true)
  }

  /**
   * @private
   */
  _initChannels() {
    const self = this
    const { config } = self.danmu
    const channelSize = config.channelSize || (/mobile/gi.test(navigator.userAgent) ? 10 : 12)
    /** @type {number} */
    let channelCount

    if (config.area) {
      const { lines, start, end } = config.area
      if (validAreaLineRule(lines)) {
        channelCount = lines

        if (self.direction === 'b2t') {
          self.width = channelCount * channelSize
        } else {
          self.height = channelCount * channelSize
        }
      } else {
        if (start >= 0 && end >= start) {
          const modulus = end - start
          if (self.direction === 'b2t') {
            self.width = Math.floor(self.width * modulus)
          } else {
            self.height = Math.floor(self.height * modulus)
          }
        }
      }
    }

    if (!isNumber(channelCount)) {
      if (self.direction === 'b2t') {
        channelCount = Math.floor(self.width / channelSize)
      } else {
        channelCount = Math.floor(self.height / channelSize)
      }
    }

    let channels = []
    for (let i = 0; i < channelCount; i++) {
      channels[i] = {
        id: i,
        queue: {
          scroll: [],
          top: [],
          bottom: []
        },
        operating: {
          scroll: false,
          top: false,
          bottom: false
        },
        bookId: {}
      }
    }

    return {
      channelSize,
      channelCount,
      channels
    }
  }

  resize(sync = false) {
    this.logger && this.logger.info('resize')
    let self = this
    if (self.resizing) {
      return
    }
    self.resizing = true

    function setItem(channels, i) {
      channels[i] = {
        id: i,
        queue: {
          scroll: [],
          top: [],
          bottom: []
        },
        operating: {
          scroll: false,
          top: false,
          bottom: false
        },
        bookId: {}
      }
    }

    function updateChannelsLower(channels, fontSize) {
      function updateTopScrollQueue(i) {
        const items = ['scroll', 'top']
        items.forEach((key_) => {
          self.channels[i].queue[key_].forEach((item) => {
            if (item.el) {
              channels[i].queue[key_].push(item)
            }
          })
        })
      }
      function updateBottomQueue(i) {
        self.channels[i].queue['bottom'].forEach((item) => {
          if (item.el) {
            channels[i + channels.length - self.channels.length].queue['bottom'].push(item)
            if (item.channel_id[0] + item.channel_id[1] - 1 === i) {
              let channel_id = [].concat(item.channel_id)
              item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]]
              item.top = item.channel_id[0] * fontSize
              if (self.danmu.config.area && self.danmu.config.area.start) {
                item.top += self.containerHeight * self.danmu.config.area.start
              }
              item.topInit()
            }
          }
        })
      }

      for (let i = 0; i < self.channels.length; i++) {
        setItem(channels, i)
        updateTopScrollQueue(i)
        updateBottomQueue(i)
      }

      for (let i = 0; i < channels.length; i++) {
        const items = ['scroll', 'top', 'bottom']
        items.forEach((key) => {
          channels[i].queue[key].forEach((item) => {
            item.resized = false
          })
        })
      }
      self.channels = channels
      if (self.direction === 'b2t') {
        self.channelWidth = fontSize
      } else {
        self.channelHeight = fontSize
      }
    }

    function updateChannelsGreater(channels, fontSize) {
      const items = ['scroll', 'top', 'bottom']

      for (let i = 0; i < channels.length; i++) {
        setItem(channels, i)

        items.forEach((key) => {
          if (key === 'top' && i > Math.floor(channels.length / 2)) {
            //
          } else if (key === 'bottom' && i <= Math.floor(channels.length / 2)) {
            //
          } else {
            let num = key === 'bottom' ? i - channels.length + self.channels.length : i
            self.channels[num].queue[key].forEach((item, index) => {
              if (!item.el) {
                return
              }
              channels[i].queue[key].push(item)
              if (key === 'bottom') {
                if (item.channel_id[0] + item.channel_id[1] - 1 === num) {
                  let channel_id = [].concat(item.channel_id)
                  item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]]
                  item.top = item.channel_id[0] * fontSize
                  if (self.danmu.config.area && self.danmu.config.area.start) {
                    item.top += self.containerHeight * self.danmu.config.area.start
                  }
                  item.topInit()
                }
              }
              self.channels[num].queue[key].splice(index, 1)
            })
          }
        })
      }
      for (let i = 0; i < channels.length; i++) {
        items.forEach((key) => {
          channels[i].queue[key].forEach((item) => {
            item.resized = false
          })
        })
      }
      self.channels = channels

      if (self.direction === 'b2t') {
        self.channelWidth = fontSize
      } else {
        self.channelHeight = fontSize
      }
    }

    function layout() {
      const { container, bulletBtn } = self.danmu

      self.container = container
      self.updatePos()
      self._cancelResizeTimer()

      if (bulletBtn.main.data) {
        bulletBtn.main.data.forEach((item) => {
          if (item.bookChannelId) {
            delete item['bookChannelId']
            self.logger && self.logger.info('resize导致' + item.id + '号优先弹幕预定取消')
          }
        })
      }
      self.logger && self.logger.info('resize导致所有轨道恢复正常使用')
      self.width = self.containerWidth
      self.height = self.containerHeight

      const { channelSize, channels } = self._initChannels()

      if (self.channels) {
        if (self.channels.length <= channels.length) {
          updateChannelsLower(channels, channelSize)
        } else {
          updateChannelsGreater(channels, channelSize)
        }
      }
      self.resizing = false
    }

    if (sync) {
      layout()
    } else {
      this._cancelResizeTimer()
      this.resizeId = requestAnimationFrame(layout)
    }
  }

  /**
   * @private
   */
  _cancelResizeTimer() {
    if (this.resizeId) {
      cancelAnimationFrame(this.resizeId)
      this.resizeId = null
    }
  }
}

export default Channel
