import BaseClass from './baseClass'
import { attachEventListener, hasOwnProperty, isNumber, getTimeStamp } from './utils/util'
import { validAreaLineRule } from './utils/validator'

/**
 * @typedef {import('./bullet').Bullet} Bullet
 */

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
    /** @type {Array.<{id: number, queue: {scroll: Array.<Bullet>, top: Array.<Bullet>, bottom: Array.<Bullet>}, operating: {scroll: boolean, top: boolean, bottom: boolean}, bookId: {}}>} */
    self.channels = []
    self.updatePos()

    attachEventListener(
      this.danmu,
      'bullet_remove',
      (r) => {
        if (r.bullet.danmu.config.trackAllocationOptimization) {
          self.removeBulletV1(r.bullet);
        } else {
          self.removeBullet(r.bullet)
        }   
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

  checkAvailableTrack(mode = 'scroll') {
    const { channels } = this
    let flag = false

    if (mode === 'scroll') {
      for (let i = 0, channel; i < channels.length; i++) {
        channel = channels[i]
        flag = true
        if (channel.operating[mode]) {
          flag = false
          continue
        }

        // 当前轨道 - 最后入轨弹幕
        const curBullet = channel.queue[mode][0]
        if (curBullet && !curBullet.fullySlideIntoScreen) {
          flag = false
          continue
        }
        if (flag) {
          break
        }
      }
    } else {
      flag = true
    }

    return flag
  }

  checkAvailableTrackV1(mode = 'scroll') {
    // 当前轨道中没有元素，或者当前轨道中分配的元素已经完全进入屏幕，认为该轨道可用
    if (document.visibilityState !== 'visible') {
      console.log('检测轨道可用性2', false);
      return false;
    }

    const available = this.channels.findIndex(channel => {
      const lastBullet = channel.queue[mode][0];
      if (lastBullet) {
        console.log('检测轨道可用性1111', lastBullet.options.text, lastBullet.fullEnterTime, getTimeStamp());
      }
      if (channel.freeze) {
        return false;
      }
      if (!lastBullet || lastBullet.fullEnterTime && lastBullet.fullEnterTime <= getTimeStamp()) {
        return true;
      }
    });
    if (available >= 0) {
      console.log('轨道可用wsy', available, available >= 0);
    }
    
    return available >= 0;
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
      if (!self.danmu || !self.danmu.container) {
        return
      }
      const { container } = self.danmu
      let size = container.getBoundingClientRect()
      if (self.danmu.updateGetBoundingCounts) {
        self.danmu.updateGetBoundingCounts();
      }
      
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
    const pos = this.container.getBoundingClientRect();
    console.log('containerWidth_计算位移')
    if (this.danmu && this.danmu.updateGetBoundingCounts) {
      this.danmu.updateGetBoundingCounts();
    }

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
      // 检查弹幕需要占据的轨道数量是否超过可用轨道总数
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
          for (let i = 0, max = channels.length - occupy; i <= max; i += occupy) {
            flag = true
            for (let j = i; j < i + occupy; j++) {
              channel = channels[j]
              if (channel.operating.scroll || (channel.bookId.scroll && channel.bookId.scroll !== bullet.id)) {
                flag = false
                break
              }
              channel.operating.scroll = true
  
              // 当前轨道 - 最后入轨弹幕
              const curBullet = channel.queue.scroll[0]
  
              if (curBullet) {
                const curBulletPos = curBullet.el.getBoundingClientRect()
                if (danmu && danmu.updateGetBoundingCounts) {
                  danmu.updateGetBoundingCounts();
                }
  
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

  addBulletV1(bullet) {
    if (!this.checkAvailableTrackV1()) {
      return false;
    }
    let channelIndex = -1;

    // 空轨道
    const emptyChannel = [];
    // 已经完全进入屏幕的轨道
    const fullEnterChannel = [];
    // 不需要等待时间的轨道 
    const noWaitChannel = [];
    // 需要重新计算元素宽高的轨道
    const recalculateChannel = [];
    const currentTime = getTimeStamp();
    
    this.channels.forEach(item => {
      if (item && item.queue && item.queue.scroll) {
        if (item.freeze) {
        } else if (item.queue.scroll.length === 0) {
          emptyChannel.push(item);
        } else if (item.queue.scroll[0]) {
          if (item.queue.scroll[0].fullEnterTime < currentTime) {
            fullEnterChannel.push(item);
          } else if (!item.queue.scroll[0].waitTimeStamp) {
            noWaitChannel.push(item);
          } else if (item.queue.scroll[0].recalculate) {
            recalculateChannel.push(item);
          } 
        }
      }
    }); 
    const fullEnterChannelSorted = fullEnterChannel.sort((a, b) => a.queue.scroll[0].fell - b.queue.scroll[0].fullLeaveTime);
    // 在元素进行入轨判断前，对轨道可用性进行排序，减少不必要的计算
    const sortChannel = [...emptyChannel, ...fullEnterChannelSorted, ...noWaitChannel, ...recalculateChannel];
    console.log('sortChannel', emptyChannel.map(item => item.id), fullEnterChannelSorted.map(item => item.id), noWaitChannel.map(item => item.id))

    for (let i = 0; i < sortChannel.length; i++) {
      const channel = sortChannel[i];
      const lastBullet = channel.queue.scroll[0];
      // 当前轨道为空
      if (!lastBullet) { 
        channelIndex = channel.id;
        break;
      }
  
      // 元素暂停，重新设置字体大小后，增加recalculate标记，在碰到冲突的时候，需要实时计算位置
      if (lastBullet.recalculate) {
        const lastBulletPos = lastBullet.el.getBoundingClientRect();
        if (this.danmu && this.danmu.updateGetBoundingCounts) {
          this.danmu.updateGetBoundingCounts();
        }   
        if (this.containerRight > lastBulletPos.right) {
          const diff = lastBullet.fullLeaveTime - currentTime - this.containerWidth / bullet.moveVV1;
          bullet.waitTimeStamp = currentTime + diff;
          console.log('waitTimeStamp1', bullet.options.text, diff, performance.now())
        } else {
          const lastbulletOriginV = lastBulletPos.right / (lastBullet.fullLeaveTime - currentTime);
          const interval = (lastBulletPos.right - this.containerWidth) / lastbulletOriginV;
          const diff = lastBullet.fullLeaveTime - currentTime - interval - this.containerWidth / bullet.moveVV1;
          bullet.waitTimeStamp = Math.max(currentTime + interval, currentTime + diff);
          console.log('waitTimeStamp2', bullet.options.text, diff, performance.now())
        }
        channelIndex = channel.id;
        break;
       
      } else if (lastBullet.waitTimeStamp || !lastBullet.startTime || !lastBullet.fullEnterTime) {
        //队列中还有元素在等待，队列繁忙
        console.log('addBulletV1_轨道可用1', lastBullet.options.text,  '元素是否重新计算', lastBullet.recalculate, lastBullet.waitTimeStamp, lastBullet.startTime, lastBullet.fullEnterTime)
        return false;
      } else if (lastBullet.fullEnterTime < currentTime) {
        // 元素已上屏
        // 轨道前面元素的速度更大
        if (lastBullet.moveVV1 > bullet.moveVV1) {
          channelIndex = channel.id;
          break;
        }
        const diff = lastBullet.fullLeaveTime - currentTime - this.containerWidth / bullet.moveVV1;
        channelIndex = channel.id;
        if (diff > 0) {
          bullet.waitTimeStamp = currentTime + diff;
          console.log('waitTimeStamp1', bullet.options.text, diff, performance.now())
        }
        break;
      }
    }
    
    if (channelIndex > -1) {
      const channel = this.channels[channelIndex];
      channel.queue.scroll.unshift(bullet);
      bullet.channelIndex = channelIndex;
      bullet.top = channelIndex * this.channelHeight;
      console.log('channelCounu', bullet.options.text, this.channelHeight, channelIndex)
      bullet.channelId = channelIndex;    
      bullet.startMoveV1();
      return true;
    }

    return false;
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

  removeBulletV1(bullet) {
    if (bullet && typeof bullet.channelId !== 'undefined' && this.channels[bullet.channelId]) {
      const channel = this.channels[bullet.channelId];
      channel.operating[bullet.mode] = true;
      const currentQueue = channel.queue[bullet.mode];
      for (let index = currentQueue.length - 1; index >= 0; index--) {
        if (currentQueue[index].id === bullet.id) {
          currentQueue.splice(index, 1);
          channel.operating[bullet.mode] = false;
          break;
        }
      }
    }
    if (bullet.options.loop) {
      this.danmu.bulletBtn.main.playedData.push(bullet.options)
    }
  }

  resizeSync() {
    this.resize(true)
  }

  _initChannels(csize) {
    if (this.danmu && this.danmu.config && this.danmu.config.trackAllocationOptimization) {
      return this._initChannelsV1(csize);
    }
    return this._initChannelsV0(csize);
  }

  /**
   * @private
   */
  _initChannelsV0(csize) {
    if (!this.danmu || !this.danmu.config) {
      return
    }
    const self = this
    const { config } = self.danmu
    const channelSize = csize || config.channelSize || (/mobile/gi.test(navigator.userAgent) ? 10 : 12)
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

  _initChannelsV1(csize) {
    if (!this.danmu || !this.danmu.config) {
      return
    }

    const { config } = this.danmu
    const channelSize = csize || config.channelSize || (/mobile/gi.test(navigator.userAgent) ? 10 : 12)
    let channelCount

    if (config.area) {
      const { lines, start, end } = config.area;
      if (validAreaLineRule(lines)) {
        channelCount = Number(lines);
        this.height = channelCount * channelSize;
      } else {
        if (start >= 0 && end >= start) {
          this.height = Math.floor(this.containerHeight * (end - start));
          channelCount = Math.floor(this.height / channelSize);
        }
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
    if (this.danmu && this.danmu.config && this.danmu.config.trackAllocationOptimization) {
      return this.resizeV1(sync);
    }
    return this.resizeV0(sync);
  }

  resizeV0(sync) {
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

  updateChannlState(csize) {
    const { channelCount, channels, channelSize } = this._initChannels(csize);
    const originChannel = this.channels;
    if (originChannel) {
      const currentLen = originChannel.length;
      if (originChannel.length <= channelCount) {
        // 需要扩轨道
        originChannel.push(...channels.slice(currentLen));
      } else { 
        // 需要缩轨道
        originChannel.forEach((item, index) => item.freeze = Boolean(index >= channelCount));
      }
      this.channels = originChannel;
    } else {
      // 初始化轨道
      this.channels = channels;
    }
    this.channelHeight = channelSize;
  }

  resizeV1(sync) {
    this.updatePos();
    this.width = this.containerWidth;
    this.height = this.containerHeight;
    this.danmu.main.queue.forEach(item => {
      item.recalculate = true;
    });
    this.updateChannlState();
    if (!this.danmu || !this.danmu.main || !this.danmu.main.queue) {
      return;
    }

    this.danmu.main.queue.forEach((item) => {
      item.pauseMove();
    });
    if (this.danmu && this.danmu.updateQueueTimestamp) {
      // 更新元素位置与位移
      this.danmu.updateQueueTimestamp();
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