import {
  OPERATION_ENUM,
  PACKET_FRAME_CONFIG,
  PACKET_FRAME_ENUM,
  PROTOCAL_VERSION_ENUM,
} from "../common/msg-struct";
import { str2bytes, bytes2str } from "./convert";
import { inflate } from "pako";
import { parser } from "./json-parser";

export const generatePacket = (
  action: OPERATION_ENUM = OPERATION_ENUM.OP_HEARTBEAT,
  payload = ""
) => {
  const packet = str2bytes(payload);
  // 消息体长度 + 消息头长度 (头部长度固定为 16 字节，包含消息体长度、协议版本、操作码、序列号等信息)
  const bodyLength =
    packet.length + PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.HEADER_LENGTH].value;
  const buff = new ArrayBuffer(bodyLength);
  // 消息体 buffer
  const dataBuf = new DataView(buff);
  // 消息头中 消息体长度, 4 字节 32位
  dataBuf.setUint32(
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.PACKET_LENGTH].offset,
    bodyLength
  );
  // 消息头中 消息头长度, 2 字节
  dataBuf.setUint16(
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.HEADER_LENGTH].offset,
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.HEADER_LENGTH].value
  );
  // 消息头中 协议版本, 2 字节
  dataBuf.setUint16(
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.PROTOCOL_VERSION].offset,
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.PROTOCOL_VERSION].value
  );
  // 消息头中 操作码, 4 字节
  dataBuf.setUint32(
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.OPERATION].offset,
    action
  );
  // 消息头中 序列号, 4 字节
  dataBuf.setUint32(
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.SEQUENCE_ID].offset,
    PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.SEQUENCE_ID].value
  );
  // 消息体
  for (let i = 0; i < packet.length; i++) {
    dataBuf.setUint8(
      PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.BODY].offset + i,
      packet[i]
    );
  }
  return dataBuf;
};

export const parsePacket = (data: DataView) => {
  // 获取 消息体总长度（头部长度+ 消息体长度）
  const packetLen = data.getUint32(PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.PACKET_LENGTH].offset);
  // 获取 消息头长度
  const headerLen = data.getUint16(PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.HEADER_LENGTH].offset);
  // 获取 协议版本
  const protocolVer = data.getUint16(PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.PROTOCOL_VERSION].offset);
  // 获取 操作码
  const operation = data.getUint32(PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.OPERATION].offset);
  // 获取消息体
  const body = new Uint8Array(data.buffer, PACKET_FRAME_CONFIG[PACKET_FRAME_ENUM.BODY].offset, packetLen - headerLen);

  if (operation !== OPERATION_ENUM.OP_SEND_SMS_REPLY) {
    return [];
  }

  let bodyStr = "[]";

  // 正常返回直接解析 v0
  if (protocolVer === PROTOCAL_VERSION_ENUM.NORMAL) {
    bodyStr = bytes2str(body);
  }

  // 压缩返回解析 v2
  if (protocolVer === PROTOCAL_VERSION_ENUM.ZLIB) {
    const bytes = inflate(body);
    bodyStr = bytes2str(bytes);
  }

  try {
    const rs = parser(bodyStr);
    const result = rs.map((str: string) => {
      return JSON.parse(str);
    });
    return result;
  } catch (error) {
    console.error('解析消息体时出错:', error);
    return [];
  }
}