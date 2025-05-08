/* eslint-disable @typescript-eslint/no-explicit-any */
import Socket from './socket';


/**
 * bilibili房间类，用于管理房间的连接、销毁和消息订阅等操作。
 */
class Room {
  private roomid: number;
  private socket: Socket | null = null;

  constructor(roomid: number, userid: number, token: string) {
    // 增加输入验证
    if (typeof roomid !== 'number' || isNaN(roomid)) {
      throw new Error('房间号必须为有效的数字');
    }
    this.roomid = roomid;
    this.socket = new Socket(roomid, userid, token);
  }

  /**
   * 初始化 socket 连接
   */
  private _init(): void {
    this.socket?.init();
  }

  /**
   * 启动房间连接，加入指定房间
   * @returns 当前 Room 实例，支持链式调用
   */
  public start(): this {
    console.log(`加入房间${this.roomid}`);
    try {
      this._init();
    } catch (error) {
      console.error(`启动房间 ${this.roomid} 连接时出错:`, error);
    }
    return this;
  }

  /**
   * 销毁实例，关闭 socket 连接并清理相关资源
   */
  public destroy(): void {
    try {
      // 关闭socket
      this.socket?.close();
      console.log(`退出房间${this.roomid}`);
    } catch (error) {
      console.error(`退出房间 ${this.roomid} 时出错:`, error);
    } finally {
      this.socket = null; 
    }
  }

  subscribe (fn: (v: any) => void | ((v: any) => void)[]) {
    const fns = Array.isArray(fn) ? fn : [fn]
    this.socket?.addMethods(fns)
    return this
  }
}

export default Room;
