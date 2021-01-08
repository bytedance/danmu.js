import BaseClass from './baseClass'
import util from './utils/util'

/**
 * [Channel 弹幕轨道控制]
 * @type {Class}
 */
class Channel extends BaseClass {
  constructor (danmu) {
    super()
    this.setLogger('channel')
    this.danmu = danmu
    this.reset(true)
    let self = this
    util.on(this.danmu, 'bullet_remove', r => {
      self.removeBullet(r.bullet)
    }, 'destroy')
    this.direction = danmu.direction
    util.on(this.danmu, 'changeDirection', direction => {
      self.direction = direction
    }, 'destroy')

    this.containerPos = this.danmu.container.getBoundingClientRect()
    this.containerWidth = this.containerPos.width
    this.containerHeight = this.containerPos.height
    this.containerLeft = this.containerPos.left
    this.containerRight = this.containerPos.right
    util.on(this.danmu, 'channel_resize', () => {
      self.containerPos = self.danmu.container.getBoundingClientRect()
      if (self.resizing) {
        return
      }
      self.containerWidth = self.containerPos.width
      self.containerHeight = self.containerPos.height
      self.containerLeft = self.containerPos.left
      self.containerRight = self.containerPos.right
      self.resize(true)
    }, 'destroy')
  }
  destroy () {
    this.logger.info('destroy')
    clearTimeout(this.resizeTimer)
    // clearTimeout(this.resetTimer)
    this.channels = []
    for (let k in this) {
      delete this[k]
    }
  }
  resize (isFullscreen = false) {
    this.logger.info('resize')
    let container = this.danmu.container
    let self = this
    if (self.resizing) {
      return
    }
    self.resizing = true
    this.resizeTimer = setTimeout(function () {
      if (self.danmu.bulletBtn.main.data) {
        self.danmu.bulletBtn.main.data.forEach(item => {
          if (item.bookChannelId) {
            delete item['bookChannelId']
            self.logger.info('resize导致' + item.id + '号优先弹幕预定取消')
          }
        })
      }
      self.logger.info('resize导致所有轨道恢复正常使用')
      let size = container.getBoundingClientRect()
      self.width = size.width
      self.height = size.height
  
      if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
        if(self.direction === 'b2t') {
          self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start)
        } else {
          self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start)
        }
      }
      self.container = container
      let fontSize = self.danmu.config.channelSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12)
      let channelSize
      if(self.direction === 'b2t') {
        channelSize = Math.floor(self.width / fontSize)
      } else {
        channelSize = Math.floor(self.height / fontSize)
      }
      let channels = []
      for (let i = 0; i < channelSize; i++) {
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
      if (self.channels && self.channels.length <= channels.length) {
        for (let i = 0; i < self.channels.length; i++) {
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
          };
          ['scroll', 'top'].forEach(key => {
            self.channels[i].queue[key].forEach(item => {
              if (item.el) {
                channels[i].queue[key].push(item)
                if(!item.resized) {
                  item.pauseMove(self.containerPos, isFullscreen)
                  if (item.danmu.bulletBtn.main.status !== 'paused') {
                    item.startMove(self.containerPos)
                  }
                  item.resized = true
                }
              }
            })
          })
          self.channels[i].queue['bottom'].forEach(item => {
            if (item.el) {
              channels[i + channels.length - self.channels.length].queue['bottom'].push(item)
              if(item.channel_id[0] + item.channel_id[1] - 1 === i) {
                let channel_id = [].concat(item.channel_id)
                item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]]
                item.top = item.channel_id[0] * fontSize
                if (self.danmu.config.area && self.danmu.config.area.start) {
                  item.top += self.containerHeight * self.danmu.config.area.start
                }
                item.topInit()
              }
              if(!item.resized) {
                item.pauseMove(self.containerPos, isFullscreen)
                if (item.danmu.bulletBtn.main.status !== 'paused') {
                  item.startMove(self.containerPos)
                }
                item.resized = true
              }
            }
          })
        }
        for (let i = 0; i < channels.length; i++) {
          ['scroll', 'top', 'bottom'].forEach(key => {
            channels[i].queue[key].forEach(item => {
              // console.log('resized 重置:' + item)
              item.resized = false
            })
          })
        }
        self.channels = channels
        if(self.direction === 'b2t') {
          self.channelWidth = fontSize
        } else {
          self.channelHeight = fontSize
        }
      } else if (self.channels && self.channels.length > channels.length) {
        for (let i = 0; i < channels.length; i++) {
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
          };
          ['scroll', 'top', 'bottom'].forEach(key => {
            if (key === 'top' && i > Math.floor(channels.length / 2)) {
              //
            } else if (key === 'bottom' && i <= Math.floor(channels.length / 2)) {
               // 
            } else {
              let num = key === 'bottom' ? i - channels.length + self.channels.length : i
              self.channels[num].queue[key].forEach((item, index) => {
                if (item.el) {
                  channels[i].queue[key].push(item)
                  if(key === 'bottom') {
                    if(item.channel_id[0] + item.channel_id[1] - 1 === num) {
                      let channel_id = [].concat(item.channel_id)
                      item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]]
                      item.top = item.channel_id[0] * fontSize
                      if (self.danmu.config.area && self.danmu.config.area.start) {
                        item.top += self.containerHeight * self.danmu.config.area.start
                      }
                      item.topInit()
                    }
                  }
                  item.pauseMove(self.containerPos, isFullscreen)
                  if (item.danmu.bulletBtn.main.status !== 'paused') {
                    item.startMove(self.containerPos)
                  }
                  if(!item.resized) {
                    item.resized = true
                  }
                }
                self.channels[num].queue[key].splice(index, 1)
              })
            }
          })
        }
        // for (let i = channels.length; i < self.channels.length; i++) {
        //   ['scroll', 'top', 'bottom'].forEach(key => {
        //     self.channels[i].queue[key].forEach(item => {
        //       item.pauseMove(self.containerPos)
        //       item.remove()
        //     })
        //   })
        // }
        for (let i = 0; i < channels.length; i++) {
          ['scroll', 'top', 'bottom'].forEach(key => {
            channels[i].queue[key].forEach(item => {
              // console.log('resized 重置:' + item)
              item.resized = false
            })
          })
        }
        self.channels = channels
        if(self.direction === 'b2t') {
          self.channelWidth = fontSize
        } else {
          self.channelHeight = fontSize
        }
      }
      self.resizing = false
    }, 10)
  }
  addBullet (bullet) {
    // this.logger.info(`addBullet ${bullet.options.txt || '[DOM Element]'}`)
    let self = this
    let danmu = this.danmu
    let channels = this.channels
    let channelHeight, channelWidth, occupy
    
    if(self.direction === 'b2t') {
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
      let flag = true, channel, pos = -1
      for (let i = 0, max = channels.length; i < max; i++) {
        if (channels[i].queue[bullet.mode].some(item => item.id === bullet.id)) {
          return {
            result: false,
            message: `exsited, channelOrder=${i},danmu_id=${bullet.id}`
          }
        }
      }
      if(bullet.mode === 'scroll') {
        for (let i = 0, max = channels.length - occupy; i <= max; i++) {
          flag = true
          for (let j = i; j < i + occupy; j++) {
            channel = channels[j]
            if (channel.operating.scroll) {
              flag = false
              break
            }
            if ((channel.bookId.scroll || bullet.prior) && (channel.bookId.scroll !== bullet.id)) {
              flag = false
              break
            }
            channel.operating.scroll = true
            let curBullet = channel.queue.scroll[0]
            if (curBullet) {
              let curBulletPos = curBullet.el.getBoundingClientRect()
              if(self.direction === 'b2t') {
                if (curBulletPos.bottom > self.containerPos.bottom) {
                  flag = false
                  channel.operating.scroll = false
                  break
                }
              } else {
                if (curBulletPos.right > self.containerPos.right) {
                  flag = false
                  channel.operating.scroll = false
                  break
                }
              }

              // Vcur * t + Scur已走 - Widthcur = Vnew * t
              // t = (Scur已走 - Widthcur) / (Vnew - Vcur)
              // Vnew * t < Widthplayer
              let curS, curV, curT, newS, newV, newT
              if(self.direction === 'b2t') {
                curS = curBulletPos.top - self.containerPos.top + curBulletPos.height

                curV = (self.containerPos.height + curBulletPos.height) / curBullet.duration
                curT = curS / curV

                newS = self.containerPos.height
                newV = (self.containerPos.height + bullet.height) / bullet.duration
              } else {
                curS = curBulletPos.left - self.containerPos.left + curBulletPos.width

                curV = (self.containerPos.width + curBulletPos.width) / curBullet.duration
                curT = curS / curV

                newS = self.containerPos.width
                newV = (self.containerPos.width + bullet.width) / bullet.duration
              }
              newT = newS / newV
              if (!danmu.config.bOffset) {
                danmu.config.bOffset = 0
              }
              if (curV < newV && curT + danmu.config.bOffset > newT) {
                flag = false
                channel.operating.scroll = false
                break
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
            if(j > Math.floor(channels.length / 2)) {
              flag = false
              break
            }
            channel = channels[j]
            if (channel.operating[bullet.mode]) {
              flag = false
              break
            }
            if ((channel.bookId[bullet.mode] || bullet.prior) && (channel.bookId[bullet.mode] !== bullet.id)) {
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
            if(j <= Math.floor(channels.length / 2)) {
              flag = false
              break
            }
            channel = channels[j]
            if (channel.operating[bullet.mode]) {
              flag = false
              break
            }
            if ((channel.bookId[bullet.mode] || bullet.prior) && (channel.bookId[bullet.mode] !== bullet.id)) {
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
            self.logger.info(i + '号轨道恢复正常使用')
          }
          channel.operating[bullet.mode] = false
        }
        if (bullet.prior) {
          self.logger.info(bullet.id + '号优先弹幕运行完毕')
          delete bullet['bookChannelId']
          if(danmu.player) {
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

        if(self.direction === 'b2t') {
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
            if (!item.prior && !item.options.realTime && item.el && item.el.getBoundingClientRect().left > self.containerPos.right && item.start >= start) {
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
            for (let i = deleteItem.channel_id[0], max = deleteItem.channel_id[0] + deleteItem.channel_id[1]; i < max; i++) {
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
          if (!bullet.bookChannelId) {
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
                self.logger.info(j + '号轨道被' + bullet.id + '号优先弹幕预定')
              }
              let nextAddTime = 2
              if(danmu.player) {
                let dataList = danmu.bulletBtn.main.data
                dataList.some(function (item) {
                  if (item.id === bullet.id) {
                    self.logger.info(bullet.id + '号优先弹幕将于' + nextAddTime + '秒后再次请求注册')
                    item.start += nextAddTime * 1000
                    item.bookChannelId = [pos, occupy]
                    self.logger.info(`${bullet.id}号优先弹幕预定了${pos}~${pos + occupy - 1}号轨道`)
                    return true
                  } else {
                    return false
                  }
                })
              }
            }
          } else {
            let nextAddTime = 2
            if(danmu.player) {
              let dataList = danmu.bulletBtn.main.data
              dataList.some(function (item) {
                if (item.id === bullet.id) {
                  self.logger.info(bullet.id + '号优先弹幕将于' + nextAddTime + '秒后再次请求注册')
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
  removeBullet (bullet) {
    this.logger.info(`removeBullet ${bullet.options.txt || '[DOM Element]'}`)
    // console.log('removeBullet')
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
    if(bullet.options.loop) {
      this.danmu.bulletBtn.main.playedData.push(bullet.options)
    }
  }
  resetArea () {
    this.logger.info('resetArea')
    // console.log('resetArea')
    let container = this.danmu.container
    let self = this
    let size = container.getBoundingClientRect()
    self.width = size.width
    self.height = size.height
    if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
      if(self.direction === 'b2t') {
        self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start)
      } else {
        self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start)
      }
    }
    self.container = container
    let fontSize =self.danmu.config.channelSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12)
    let channelSize
    if(self.direction === 'b2t') {
      channelSize = Math.floor(self.width / fontSize)
    } else {
      channelSize = Math.floor(self.height / fontSize)
    }

    let channels = []
    for (let i = 0; i < channelSize; i++) {
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

    if (self.channels && self.channels.length <= channels.length) {
      for (let i = 0; i < self.channels.length; i++) {
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
        };
        ['scroll', 'top'].forEach(key => {
          self.channels[i].queue[key].forEach(item => {
            if (item.el) {
              channels[i].queue[key].push(item)
              if(!item.resized) {
                item.pauseMove(self.containerPos, false)
                item.startMove(self.containerPos)
                item.resized = true
              }
            }
          })
        })
        self.channels[i].queue['bottom'].forEach(item => {
          if (item.el) {
            channels[i + channels.length - self.channels.length].queue['bottom'].push(item)
            if(item.channel_id[0] + item.channel_id[1] - 1 === i) {
              let channel_id = [].concat(item.channel_id)
              item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]]
              item.top = item.channel_id[0] * fontSize
              if (self.danmu.config.area && self.danmu.config.area.start) {
                item.top += self.containerHeight * self.danmu.config.area.start
              }
              item.topInit()
            }
            if(!item.resized) {
              item.pauseMove(self.containerPos, false)
              item.startMove(self.containerPos)
              item.resized = true
            }
          }
        })
      }
      for (let i = 0; i < channels.length; i++) {
        ['scroll', 'top', 'bottom'].forEach(key => {
          channels[i].queue[key].forEach(item => {
            // console.log('resized 重置:' + item)
            item.resized = false
          })
        })
      }
      self.channels = channels
      if(self.direction === 'b2t') {
        self.channelWidth = fontSize
      } else {
        self.channelHeight = fontSize
      }
    } else if (self.channels && self.channels.length > channels.length) {
      for (let i = 0; i < channels.length; i++) {
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
        };
        ['scroll', 'top', 'bottom'].forEach(key => {
          if (key === 'top' && i > Math.floor(channels.length / 2)) {
            //
          } else if (key === 'bottom' && i <= Math.floor(channels.length / 2)) {
            //
          } else {
            let num = key === 'bottom' ? i - channels.length + self.channels.length : i
            self.channels[num].queue[key].forEach((item, index) => {
              if (item.el) {
                channels[i].queue[key].push(item)
                if(key === 'bottom') {
                  if(item.channel_id[0] + item.channel_id[1] - 1 === num) {
                    let channel_id = [].concat(item.channel_id)
                    item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]]
                    item.top = item.channel_id[0] * fontSize
                    if (self.danmu.config.area && self.danmu.config.area.start) {
                      item.top += self.containerHeight * self.danmu.config.area.start
                    }
                    item.topInit()
                  }
                }
                if(!item.resized) {
                  item.pauseMove(self.containerPos, false)
                  item.startMove(self.containerPos)
                  item.resized = true
                }
              }
              self.channels[num].queue[key].splice(index, 1)
            })
          }
        })
      }
      // for (let i = channels.length; i < self.channels.length; i++) {
      //   ['scroll', 'top', 'bottom'].forEach(key => {
      //     self.channels[i].queue[key].forEach(item => {
      //       item.pauseMove(self.containerPos)
      //       item.remove()
      //     })
      //   })
      // }
      for (let i = 0; i < channels.length; i++) {
        ['scroll', 'top', 'bottom'].forEach(key => {
          channels[i].queue[key].forEach(item => {
            // console.log('resized 重置:' + item)
            item.resized = false
          })
        })
      }
      self.channels = channels
      if(self.direction === 'b2t') {
        self.channelWidth = fontSize
      } else {
        self.channelHeight = fontSize
      }
    }
  }
  reset (isInit = false) {
    this.logger.info('reset')
    let container = this.danmu.container
    let self = this
    if (self.danmu.bulletBtn && self.danmu.bulletBtn.main) {
      self.danmu.bulletBtn.main.queue.forEach(item => {
        item.pauseMove(self.containerPos)
        item.remove()
      })
    }
    if (self.channels && self.channels.length > 0) {
      ['scroll', 'top', 'bottom'].forEach(key => {
        for (let i = 0; i < self.channels.length; i++) {
          self.channels[i].queue[key].forEach(item => {
            item.pauseMove(self.containerPos)
            item.remove()
          })
        }
      })
    }
    if (self.danmu.bulletBtn && self.danmu.bulletBtn.main && self.danmu.bulletBtn.main.data) {
      self.danmu.bulletBtn.main.data.forEach(item => {
        item.hasAttached = false
      })
    }
    function channelReset() {
      let size = container.getBoundingClientRect()
      self.width = size.width
      self.height = size.height
      if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
        if(self.direction === 'b2t') {
          self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start)
        } else {
          self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start)
        }
      }
      self.container = container
      let fontSize = self.danmu.config.channelSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12)
      let channelSize
      if(self.direction === 'b2t') {
        channelSize = Math.floor(self.width / fontSize)
      } else {
        channelSize = Math.floor(self.height / fontSize)
      }

      let channels = []
      for (let i = 0; i < channelSize; i++) {
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
      self.channels = channels
      if(self.direction === 'b2t') {
        self.channelWidth = fontSize
      } else {
        self.channelHeight = fontSize
      }
    }
    if(isInit) {
      this.resetTimer = setTimeout(channelReset, 200)
    } else {
      channelReset();
    }
  }
  resetWithCb (cb, main) {
    this.logger.info('resetWithCb')
    let container = this.danmu.container
    let self = this
    if (self.channels && self.channels.length > 0) {
      ['scroll', 'top', 'bottom'].forEach(key => {
        for (let i = 0; i < self.channels.length; i++) {
          self.channels[i].queue[key].forEach(item => {
            item.pauseMove(self.containerPos)
            item.remove()
          })
        }
      })
    }
    let size = container.getBoundingClientRect()
    self.width = size.width
    self.height = size.height
    if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
      if(self.direction === 'b2t') {
        self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start)
      } else {
        self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start)
      }
    }
    self.container = container
    let fontSize = self.danmu.config.channelSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12)
    let channelSize
    if(self.direction === 'b2t') {
      channelSize = Math.floor(self.width / fontSize)
    } else {
      channelSize = Math.floor(self.height / fontSize)
    }
    let channels = []
    for (let i = 0; i < channelSize; i++) {
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
    self.channels = channels
    self.channelHeight = fontSize
    if (cb) {
      cb(true, main)
    }
  }
}

export default Channel
