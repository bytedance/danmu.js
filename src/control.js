import BaseClass from './baseClass'
import Main from './main'
import { createDom, hasOwnProperty } from './utils/util'

class Control extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu) {
    super()
    this.setLogger('control')
    this.danmu = danmu
    this.main = new Main(danmu)
    if (!danmu.config.defaultOff) {
      this.main.start()
    }
  }

  createSwitch(state = true) {
    this.logger && this.logger.info('createSwitch')
    this.switchBtn = createDom(
      'dk-switch',
      '<span class="txt">弹</span>',
      {},
      `danmu-switch ${state ? 'danmu-switch-active' : ''}`
    )
    return this.switchBtn
  }

  destroy() {
    this.logger && this.logger.info('destroy')
    this.main.destroy()
    for (const k in this) {
      if (hasOwnProperty.call(this, k)) {
        delete this[k]
      }
    }
  }
}

export default Control
