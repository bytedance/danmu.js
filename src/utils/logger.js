const DEBUG = window.location.href.indexOf('danmu-debug') > -1

class Logger {
    constructor (constructorName) {
      this.constructorName = constructorName || ''
    }
    info (message, ...optionalParams) {
        DEBUG && console.log(`[Danmu Log][${this.constructorName}]`, message, ...optionalParams)
    }
}

export default Logger