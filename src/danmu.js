import EventEmitter from 'event-emitter'
import { version } from '../version.json'
import BaseClass from './baseClass'
import Control from './control'
import RecyclableDomList from './domRecycle'
import { addObserver, unObserver } from './resizeObserver'
import { addClass, deepCopy, getTimeStamp, isNumber, styleUtil } from './utils/util'

/**
 * @typedef {import('./baseClass').CommentData} CommentData
 */
/**
 * @typedef {import('./baseClass').GlobalHooks} GlobalHooks
 */

export class DanmuJs extends BaseClass {
  constructor(options) {
    super()

    // logger
    this.setLogger('danmu')
    this.logger && this.logger.info(`danmu.js version: ${version}`)

    // configure
    const config = (this.config = {
      overlap: false,
      area: {
        start: 0,
        end: 1,
        lines: undefined
      },
      hooks: undefined,
      live: false,
      comments: [],
      direction: 'r2l',
      needResizeObserver: false,
      dropStaleComments: false,
      channelSize: undefined,
      maxCommentsLength: undefined,
      bulletOffset: undefined,
      interval: 2000,
      highScorePriority: true, // 高积分优先展示
      chaseEffect: true // 滚动弹幕追逐效果
    })
    deepCopy(config, options)

    // Add event subscription handler
    EventEmitter(this)

    /**
     * @type {GlobalHooks}
     */
    this.globalHooks = {}
    if (config.hooks) {
      this.hooks(config.hooks)
    }

    this.hideArr = []
    this.recycler = new RecyclableDomList() // TODO删除RecyclableDomList的逻辑
    this.getBoundingCounts = 0; // 统计获取元素位置次数
    this.danmuElCreateCounts = 0; // 创建弹幕元素次数

    // freezed comment
    this.freezeId = null

    config.comments.forEach((comment) => {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.mode) {
        comment.mode = 'scroll'
      }
    })

    /**
     * @type {HTMLElement}
     */
    this.container = config.container && config.container.nodeType === 1 ? config.container : null
    if (!this.container) {
      // eslint-disable-next-line quotes
      this.emit('error', "container id can't be empty")
      return false
    }
    if (config.containerStyle) {
      const style = config.containerStyle
      Object.keys(style).forEach((key) => {
        this.container.style[key] = style[key]
      })
    }
    addClass(this.container, 'danmu')
    this.live = config.live
    this.player = config.player
    this.direction = config.direction
    this.bulletBtn = new Control(this)
    this.main = this.bulletBtn.main
    this.isReady = true
    this.emit('ready')
    this.logger && this.logger.info('ready')
    this.addResizeObserver()
  }

  get status() {
    if (!this.main) {
      return 'destroy'
    }
    return this.main.status;
  }

  get state() {
    const main = this.main
    return {
      status: main.status,
      comments: main.data,
      bullets: main.queue,
      displayArea: main.channel.getRealOccupyArea()
    }
  }

  get containerPos() {
    return this.main.channel.containerPos
  }

  updateGetBoundingCounts(counts) {
    if (this.getBoundingCounts !== undefined) {
      if (typeof counts === 'number') {
        this.getBoundingCounts = counts
      } else {
        this.getBoundingCounts++;
      }
    }
  }

  updateDanmuElCreateCounts(counts) {
    if (this.danmuElCreateCounts !== undefined) {
      if (typeof counts === 'number') {
        this.danmuElCreateCounts = counts;
      } else {
        this.danmuElCreateCounts++;
      }
    }
  }

  /**
   * @param {GlobalHooks} options
   */
  hooks(options) {
    deepCopy(this.globalHooks, options)
  }

  addResizeObserver() {
    if (this.config.needResizeObserver && this.container) {
      addObserver(this.container, () => {
        this.logger && this.logger.info('needResizeObserver')
        this.resize()
      })
    }
  }

  start() {
    this.logger && this.logger.info('start')
    this.main && this.main.start()
  }

  pause() {
    this.logger && this.logger.info('pause')
    this.main && this.main.pause()
  }

  play() {
    this.logger && this.logger.info('play')
    this.main && this.main.play()
  }

  stop() {
    this.logger && this.logger.info('stop')
    this.main && this.main.stop()
  }

  clear() {
    this.logger && this.logger.info('clear')
    this.main && this.main.clear()
  }

  clearNot() {

  }

  destroy() {
    unObserver(this.container)
    this.logger && this.logger.info('destroy')
    this.stop()
    this.bulletBtn && this.bulletBtn.destroy()
    this.recycler && this.recycler.destroy()
    for (let k in this) {
      delete this[k]
    }
    this.emit('destroy')
  }

  /**
   * @param {CommentData} comment
   */
  sendComment(comment) {
    const { main, logger } = this
    logger && logger.info(`sendComment: ${comment.txt || '[DOM Element]'}`)

    if (!main) return

    // Set a default bullet show time
    if (!comment.duration) {
      comment.duration = 15000
    }

    if (comment && comment.id && comment.duration && (comment.el || comment.elLazyInit || comment.txt)) {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.style) {
        comment.style = {
          opacity: undefined,
          fontSize: undefined
        }
      }
      if (comment.style) {
        if (this.opacity && this.opacity !== comment.style.opacity) {
          comment.style.opacity = this.opacity
        }
        if (this.fontSize && this.fontSize !== comment.style.fontSize) {
          comment.style.fontSize = this.fontSize
        }
      }
      if (comment.prior || comment.realTime) {
        main.data.unshift(comment)
        if (comment.realTime) {
          main.readData()
          main.dataHandle()
        }
      } else {
        main.data.push(comment)
      }

      main.sortData()
      main.keepPoolWatermark()
    }
  }

  setCommentID(oldID, newID) {
    this.logger && this.logger.info(`setCommentID: oldID ${oldID} newID ${newID}`)
    if (oldID && newID) {
      this.main.data.some((data) => {
        if (data.id === oldID) {
          data.id = newID
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item) => {
        if (item.id === oldID) {
          item.id = newID
          item.pauseMove()
          this.main.status !== 'paused' && item.startMove()
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentDuration(id, duration) {
    this.logger && this.logger.info(`setCommentDuration: id ${id} duration ${duration}`)

    if (id && duration) {
      duration = duration ? duration : 5000
      this.main.data.some((data) => {
        if (data.id === id) {
          data.duration = duration
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item) => {
        if (item.id === id) {
          item.duration = duration
          item.pauseMove()
          this.main.status !== 'paused' && item.startMove()
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentLike(id, like) {
    this.logger && this.logger.info(`setCommentLike: id ${id} like ${like}`)
    if (id && like) {
      this.main.data.some((data) => {
        if (data.id === id) {
          data.like = like
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item) => {
        if (item.id === id) {
          item.pauseMove()
          item.setLikeDom(like.el, like.style)
          if (item.danmu.main.status !== 'paused') {
            item.startMove()
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  restartComment(id) {
    this.logger && this.logger.info(`restartComment: id ${id}`)

    if (id) {
      const self = this
      const main = self.main

      self._releaseCtrl(id)

      if (main.status === 'closed') {
        // The main process has been stopped, there is no need to drive the barrage to run
        return
      }

      main.queue.some((item) => {
        if (item.id === id) {
          if (main.status !== 'paused') {
            item.startMove(true);
          } else {
            item.status = 'paused'
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  /**
   * @private
   */
  _releaseCtrl(id) {
    const self = this

    if (self.freezeId && id === self.freezeId) {
      self.mouseControl = false
      self.freezeId = null
    }
  }

  /**
   * @private
   */
  _freezeCtrl(id) {
    this.mouseControl = true
    this.freezeId = id
  }

  freezeComment(id) {
    this.logger && this.logger.info(`freezeComment: id ${id}`)

    if (id) {
      const self = this

      self._freezeCtrl(id)

      self.main.queue.some((item) => {
        if (item.id === id) {
          item.status = 'forcedPause'
          item.pauseMove()
          if (item.el && item.el.style) {
            styleUtil(item.el, 'zIndex', 10)
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  removeComment(id) {
    this.logger && this.logger.info(`removeComment: id ${id}`)

    if (id) {
      const self = this
      const { main } = self

      self._releaseCtrl(id)

      // remove bullet from the queue list
      main.queue = main.queue.filter((item) => {
        if (item.id === id) {
          item.remove()
          return false
        } else {
          return true
        }
      })

      // remove comment from the data list
      main.data = main.data.filter((item) => item.id !== id)
    }
  }

  /**
   * @param {Array<CommentData>} comments
   * @param {boolean} isClear
   */
  updateComments(comments, isClear = true) {
    this.logger && this.logger.info(`updateComments: ${comments.length}, isClear ${isClear}`)
    const { main } = this
    if (typeof isClear === 'boolean' && isClear) {
      main.data = []
    }
    main.data = main.data.concat(comments)
    main.sortData()
    main.keepPoolWatermark()
  }

  /**
   * 设置所有弹幕播放时长
   * @param {number} duration
   */
  setAllDuration(mode = 'scroll', duration, force = true) {
    this.logger && this.logger.info(`setAllDuration: mode ${mode} duration ${duration} force ${force}`)
    if (duration) {
      duration = duration ? duration : 5000
      if (force) {
        this.main.forceDuration = duration
      }
      this.main.data.forEach((data) => {
        if (mode === data.mode) {
          data.duration = duration
        }
      })
      this.main.queue.forEach((item) => {
        if (mode === item.mode) {
          item.duration = duration
          item.pauseMove()
          if (this.main.status !== 'paused') {
            item.startMove()
          }
        }
      })
    }
  }

  /**
   * 设置弹幕播放速率，在弹幕播放速度上乘以一个系数，控制速度的变化
   * @param {number} val
   */
  setPlayRate(mode = 'scroll', val) {
    this.logger && this.logger.info(`setPlayRate: ${val}`)
    if (isNumber(val) && val > 0) {
      this.main.playRate = val
      this.main.queue.forEach((item) => {
        if (mode === item.mode) {
          item.pauseMove()
          if (this.main.status !== 'paused') {
            item.startMove()
          }
        }
      })
    }
  }

  setOpacity(opacity) {
    this.logger && this.logger.info(`setOpacity: opacity ${opacity}`)

    if (this.container) {
      this.container.style.opacity = opacity
    }
  }

  setFontSize(size, channelSize, options) {
    if (this.config && this.config.trackAllocationOptimization) {
       this.setFontSizeV1(size, channelSize, options);
    } else {
      this.setFontSizeV0(size, channelSize, options);
    }
  }

  setFontSizeV0(
    size,
    channelSize,
    options = {
      reflow: true
    }
  ) {
    this.logger && this.logger.info(`setFontSize: size ${size} channelSize ${channelSize}`)
    this.fontSize = `${size}px`
    if (size) {
      this.main.data.forEach((data) => {
      if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
      this.main.queue.forEach((item) => {
        if (!item.options.style) {
          item.options.style = {}
        }

        item.options.style.fontSize = this.fontSize
        item.setFontSize(this.fontSize)
        if (channelSize) {
          item.top = item.channel_id[0] * channelSize;
          item.topInit()
        }
      })
    }
    if (channelSize) {
      this.config.channelSize = channelSize

      if (options.reflow) {
        this.main.channel.resizeSync()
      }
    }
  }

  setFontSizeV1(size) {
    this.fontSize = `${size}px`
    if (size) {
    
      this.main.data.forEach((data) => {
      if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
      const channelSize = Number(size) + 20;
      this.main.queue.forEach((item) => {
        if (item.el && item.fullLeaveTime && item.fullLeaveTime <= getTimeStamp() && item.status === 'start') {
          item.remove(false);
          item.status = 'end';
          return;
        }
        if (!item.options.style) {
          item.options.style = {}
        }
        item.options.style.fontSize = this.fontSize
        item.setFontSize(this.fontSize);
        // 修复先切换字号，再更新元素显示区域场景下，轨道间距异常问题
        item.top = item.channelId * channelSize;
        item.topInit();
        item.pauseMove();
      })
      this.config.channelSize = channelSize;
      this.updateQueueTimestamp();
      if (this.main && this.main.channel && this.main.channel.updateChannlState) {
        this.main.channel.updateChannlState(Number(size) + 20);
      }
    }
  }

  updateQueueTimestamp () {
    if (!this.main.channel || !this.main.channel.channels || !this.main.channel.channels) {
      return;

    }
    const canRun = this.main.status !== 'paused';
    const { containerLeft, containerRight } = this.main.channel || {};
  
    this.main.channel.channels.forEach(channel => {
      if (!channel || !channel.queue || !channel.queue.scroll || channel.queue.scroll.length === 0) {
        return;  // 队列为空
      }
      const queue = channel.queue.scroll;
      const queueLen = queue.length;
      const currentTime = getTimeStamp();

      for (let index = queueLen - 1; index >= 0; index--) {
        const bullet = queue[index];
        // 防止字体变大，后面上屏元素重叠
        bullet.resized = true;
        const lastBullet = queue[index + 1];
        const curBulletPos = bullet.el.getBoundingClientRect();
        if (this.danmu && this.danmu.updateGetBoundingCounts) {
          this.danmu.updateGetBoundingCounts();
        }
        bullet.width = curBulletPos.width;
        
        if (curBulletPos.right < containerLeft) {
          continue; // 元素已离屏
        }
        if (!lastBullet) { 
          if (canRun) {
            const leftDistance = curBulletPos.right - containerLeft;
            const leftDuration = leftDistance / bullet.moveVV1;
            bullet.fullLeaveTime = currentTime + leftDuration;
            // 更新fullEnterTime 防止字号调整后，元素迟迟不上屏
            bullet.fullEnterTime = curBulletPos.right > containerRight ? currentTime + (curBulletPos.right - containerRight) / bullet.moveVV1 : -1;
            styleUtil(bullet.el, 'transition', `transform ${leftDuration / 1000}s linear 0s`)
            styleUtil(bullet.el, 'transform', `translateX(-${leftDistance}px)`);
            bullet.status = 'start';
          }
          continue;
        }
        // 上一元素飘屏时间
        const lastBulletTime = lastBullet.fullLeaveTime - currentTime;  
        // 上一元素的右边距位置
        const lastBulletRight = containerLeft + (lastBullet.fullLeaveTime - currentTime) * lastBullet.moveVV1; 
        // 当前元素需要走过的时间和距离
        const bulletLeft = Math.max(lastBulletRight, curBulletPos.left);
        const curBulletTime = (bulletLeft - containerLeft) / bullet.moveVV1;
        // 检测冲突后，当前元素的偏移距离
        const currentLeft = bulletLeft +  Math.max(lastBulletTime - curBulletTime, 0) * bullet.moveVV1;

        if (currentLeft !== curBulletPos.left) {
          styleUtil(bullet.el, 'left', `${currentLeft}px`);
        }
        if (canRun) { 
          const currentPos = currentLeft + curBulletPos.width;
          const currentDuration = currentPos / bullet.moveVV1;
          bullet.fullLeaveTime = currentTime + currentDuration;
          // 更新fullEnterTime 防止字号调整后，元素迟迟不上屏
          bullet.fullEnterTime = currentPos > containerRight ? currentTime + (currentPos - containerRight) / bullet.moveVV1 : -1;
          styleUtil(bullet.el, 'transition', `transform ${currentDuration / 1000}s linear 0s`)
          styleUtil(bullet.el, 'transform', `translateX(-${currentPos}px) translateZ(0px)`);
          console.log('更新元素的时间和位移', bullet.options.text, currentPos, currentDuration);
          bullet.status = 'start';
        }
      }
    });
  }

  setArea(size, channelSize, options) {
    if (this.config && this.config.trackAllocationOptimization) {
       this.setAreaV1(size, channelSize, options);
    } else {
      this.setAreaV0(size, channelSize, options);
    }
  }

  setAreaV0(area) {
    this.logger && this.logger.info(`setArea: area ${area}`)
    this.config.area = area

    if (area.reflow !== false) {
      this.main.channel.resizeSync()
    }
  }

  setAreaV1(area) {
    this.config.area = area;
    if (this.main && this.main.channel && this.main.channel.updateChannlState) {
      this.main.channel.updateChannlState();
    }
  }

  hide(mode = 'scroll') {
    this.logger && this.logger.info(`hide: mode ${mode}`)
    if (this.hideArr.indexOf(mode) < 0) {
      this.hideArr.push(mode)
    }
    let arr = this.main.queue.filter((item) => mode === item.mode || (mode === 'color' && item.color))
    arr.forEach((item) => item.remove())
  }

  show(mode = 'scroll') {
    this.logger && this.logger.info(`show: mode ${mode}`)
    let index = this.hideArr.indexOf(mode)
    if (index > -1) {
      this.hideArr.splice(index, 1)
    }
  }

  /**
   * @param {'r2l'|'b2t'} direction
   */
  setDirection(direction = 'r2l') {
    this.logger && this.logger.info(`setDirection: direction ${direction}`)
    this.direction = direction
    // this.main.channel.resize()
    this.emit('changeDirection', direction)
  }

  resize() {
    this.logger && this.logger.info('resize')
    this.emit('channel_resize')
  }
}

export default DanmuJs
