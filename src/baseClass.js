import Log from './utils/logger'

class BaseClass {
  setLogger(name = '') {
    this.logger = new Log(name + '.js')
  }
}

export default BaseClass

/**
 * @typedef {{
 *  id: string
 *  start: number
 *  duration: number
 *  prior: boolean
 *  score?: number // 积分越高，越容易展示
 *  txt?: string
 *  el?: HTMLElement | Function
 *  onElDestroy?: Function
 *  mode: 'scroll' | 'top' | 'bottom'
 *  attached_: boolean // 内部属性，标记弹幕是否已经被入轨
 *  realTime?: boolean,
 *  color?: string
 * }} CommentData
 */

/**
 * @typedef {{
 *  onBulletElCreate?: (item: CommentData) => HTMLElement
 *  onBulletAttach?: (item: CommentData) => void
 *  onBulletDetach?: (item: CommentData) => void
 * }} InternalHooks
 */
