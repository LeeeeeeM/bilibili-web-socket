import Socket from './Socket'

/**
 * bilibili房间类
 */
class Room {
  constructor (roomid) {
    this.roomid = roomid
    this.socket = new Socket(roomid)
  }

  _init () {
    this.socket.init()
  }

  $start () {
    console.log(`加入房间${this.roomid}`)
    this._init()
    return this
  }

  /**
   * 销毁实例
   */
  $destroy () {
    // 关闭socket
    this.socket.close()
    this.socket = null

    console.log(`退出房间${this.roomid}`)
    this.roomid = null
  }

  $subscribe (fn) {
    const fns = Array.isArray(fn) ? fn : [fn]
    this.socket.addMethods(fns)
    return this
  }

}

export default Room
