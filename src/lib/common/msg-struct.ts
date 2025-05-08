
/**
 * 操作码相关的枚举
 * 2. 心跳包
 * 3. 心跳包回复
 * 5. 消息回复   --> 只需关注这个即可
 * 7. 鉴权（进入房间）
 * 8. 鉴权回复
 */
export enum OPERATION_ENUM {
  OP_HEARTBEAT = 2,
  OP_HEARTBEAT_REPLY = 3,
  OP_SEND_SMS_REPLY = 5,
  OP_AUTH = 7,
  OP_AUTH_REPLY = 8,
}

/**
 * 消息结构相关的枚举
 * 0. 消息长度 (消息头 + 消息体长度)
 * 1. 消息头长度
 * 2. 协议版本
 * 3. 指令
 * 4. 序列号
 * 5. 消息体
 */

export enum PACKET_FRAME_ENUM {
  PACKET_LENGTH = 'PACKET_LENGTH',
  HEADER_LENGTH = 'HEADER_LENGTH',
  PROTOCOL_VERSION = 'PROTOCOL_VERSION',
  OPERATION = 'OPERATION',
  SEQUENCE_ID = 'SEQUENCE_ID',
  BODY = 'BODY'
}

export enum PROTOCAL_VERSION_ENUM {
  NORMAL = 0,
  ZLIB = 2
}

export const PACKET_FRAME_CONFIG = {
  [PACKET_FRAME_ENUM.PACKET_LENGTH]: {
    bytes: 4,
    offset: 0
  },
  [PACKET_FRAME_ENUM.HEADER_LENGTH]: {
    bytes: 2,
    offset: 4,
    value: 16 // 固定 16
  },
  [PACKET_FRAME_ENUM.PROTOCOL_VERSION]: {
    bytes: 2,
    offset: 6,
    value: PROTOCAL_VERSION_ENUM.NORMAL, // 不压缩，使用完整发送
  },
  [PACKET_FRAME_ENUM.OPERATION]: {
    bytes: 4,
    offset: 8,
    value: OPERATION_ENUM.OP_AUTH
  },
  [PACKET_FRAME_ENUM.SEQUENCE_ID]: {
    bytes: 4,
    offset: 12,
    value: 1 // 默认为 1
  },
  [PACKET_FRAME_ENUM.BODY]: {
    offset: 16
  }
}

/**
 * 鉴权信息
 */
export interface AuthInfo {
  uid: number;
  roomid: number;
  protover: number;
  platform: string;
  type: number;
  key: string;
}