/* eslint-disable @typescript-eslint/no-explicit-any */
import wsUrl from '../common/ws';
import { OPERATION_ENUM, type AuthInfo } from '../common/msg-struct';
import { generatePacket, parsePacket } from '../utils/packet';

export default class Socket {
  private roomId: number;
  private uid: number;
  private token: string;
  private webSocket: WebSocket;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private _methods: ((v: any) => void)[];

  constructor(roomId: number, uid: number, token: string) {
    this.roomId = roomId;
    this.uid = uid;
    this.token = token;
    this.webSocket = new WebSocket(wsUrl);
    this._methods = []
  }

  init() {
    console.log(`新的 WebSocket 正在初始化...`);
    this.webSocket.binaryType = 'arraybuffer';

    this.webSocket.onopen = () => {
      const joinPacket = this.createJoinRoomPacket();
      this.webSocket.send(joinPacket.buffer);
      this.startHeartbeat();
    };

    this.webSocket.onmessage = (event) => {
      try {
        const dataView = new DataView(event.data);
        const result = parsePacket(dataView);
        this._call(result);
      } catch (error) {
        console.error('处理消息时出错:', error);
      }
    };

    this.webSocket.onclose = () => {
      console.log(`WebSocket 连接已关闭...`);
      this.stopHeartbeat();
    };

    this.webSocket.onerror = (error) => {
      console.error('WebSocket 发生错误:', error);
    };
  }

  close() {
    this.stopHeartbeat();
    this.webSocket.close();
  }

  private createJoinRoomPacket() {
    const authData: AuthInfo = {
      uid: this.uid,
      roomid: this.roomId,
      key: this.token,
      protover: 2,
      platform: 'web',
      type: 2,
    }
    const packetData = JSON.stringify(authData);
    return generatePacket(OPERATION_ENUM.OP_AUTH, packetData);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.webSocket.send(generatePacket(OPERATION_ENUM.OP_HEARTBEAT));
    }, 30 * 1000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  addMethods(fns: ((v: any) => void)[]) {
    this._methods = fns
  }

  _call(...args: any[]) {
    for (let i = 0, l = this._methods.length; i < l; i++) {
      const fn = this._methods[i]
      if (typeof fn !== 'function') continue
      fn(...args as [any])
    }
  }

}