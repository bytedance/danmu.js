import util from './utils/util'
import Main from './main'

class Control {
  constructor (danmu) {
    this.danmu = danmu
    this.main = new Main(danmu)
    if(!danmu.config.defaultOff) {
      this.main.start()
    }
  }

  createSwitch (state = true) {
    this.switchBtn = util.createDom('dk-switch', '<span class="txt">弹</span>', {}, `danmu-switch ${state ? 'danmu-switch-active' : ''}`)
    return this.switchBtn
  }
}

export default Control
