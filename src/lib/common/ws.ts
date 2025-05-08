/**
 * 获取对应的ws-url地址
 */
let WS_URL = "ws://broadcastlv.chat.bilibili.com:2244/sub";

if (window !== undefined) {
  const match = location.origin.match(/^(.+):\/\//);
  const protocol = match ? match[1] : "";
  if (protocol === "https") {
    WS_URL = "wss://broadcastlv.chat.bilibili.com:2245/sub";
  }
}

export default WS_URL;
