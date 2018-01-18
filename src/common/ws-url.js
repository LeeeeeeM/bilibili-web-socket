/**
 * 获取对应的ws-url地址
 */
let wsUrl = 'ws://broadcastlv.chat.bilibili.com:2244/sub'

if (window !== undefined) {
  const protocol = location.origin.match(/^(.+):\/\//)[1]
  if (protocol === 'https') {
    wsUrl = 'wss://broadcastlv.chat.bilibili.com:2245/sub'
  }
}

export default wsUrl
