import BaseClass from './baseClass'
import util from './utils/util'
import Main from './main'

class Control extends BaseClass {
  constructor (danmu) {
    super()
    this.setLogger('control')
    this.danmu = danmu
    this.main = new Main(danmu)
    if(!danmu.config.defaultOff) {
      this.main.start()
    }
  }

  createSwitch (state = true) {
    this.logger.info('createSwitch')
    this.switchBtn = util.createDom('dk-switch', '<span class="txt">弹</span>', {}, `danmu-switch ${state ? 'danmu-switch-active' : ''}`)
    return this.switchBtn
  }

  destroy () {
    this.logger.info('destroy')
    this.main.destroy()
    for (let k in this) {
      delete this[k]
    }
  }
}

export default Control
