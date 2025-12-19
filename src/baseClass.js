import Log from './utils/logger'

class BaseClass {
  setLogger(logger) {
    this.logger = logger instanceof Log ? logger : new Log((logger || '') + '.js')
  }
}

export default BaseClass

/**
 * @typedef {{
 *  id?: string
 *  start: number
 *  duration: number
 *  prior?: boolean
 *  score?: number // 积分越高，越容易展示
 *  txt?: string
 *  el?: HTMLElement | Function
 *  elLazyInit?: boolean // 配置了elLazyInit后，则通过hooks提供的时机进行el创建，该方式可减少dom数量
 *  mode: 'scroll' | 'top' | 'bottom'
 *  attached_?: boolean // 内部属性，标记弹幕是否已经被入轨
 *  realTime?: boolean,
 *  color?: string,
 *  bookChannelId?: [number, any]
 * }} CommentData
 */

/**
 * @typedef {{
 *  bulletCreateEl?: (item: CommentData) => HTMLElement | {
 *      el: HTMLElement
 *  } & GlobalHooks
 *  bulletAttaching?: (item: CommentData) => void
 *  bulletAttached?: (item: CommentData) => void
 *  bulletDetaching?: (item: CommentData) => void
 *  bulletDetached?: (item: CommentData, HTMLElement) => void
 * }} GlobalHooks
 */
