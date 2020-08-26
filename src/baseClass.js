import Log from './utils/logger'

class BaseClass {
  constructor () {
  }
  setLogger (name = '') {
    this.logger = new Log(name + '.js')
  }
}

export default BaseClass
