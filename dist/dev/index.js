    (function(s) {console.log(s)})('### App Framework ### Start: 0.0.2 Build 20190401');
    
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.BILIWS = factory());
}(this, function () { 'use strict';

  /**
   * 获取对应的ws-url地址
   */
  var wsUrl = 'ws://broadcastlv.chat.bilibili.com:2244/sub';

  if (window !== undefined) {
    var protocol = location.origin.match(/^(.+):\/\//)[1];
    if (protocol === 'https') {
      wsUrl = 'wss://broadcastlv.chat.bilibili.com:2245/sub';
    }
  }

  var wsUrl$1 = wsUrl;

  /**
   * 各个帧结构所需要的字段，待拓展
   */

  var messageStruct = [{
    name: 'Header Length', // 帧头
    key: 'headerLen',
    bytes: 2, // 字节长度
    offset: 4, // 偏移量
    value: 16
  }, {
    name: 'Protocol Version', // 协议版本
    key: 'ver',
    bytes: 2,
    offset: 6,
    value: 1
  }, {
    name: 'Operation', // 指令
    key: 'op',
    bytes: 4,
    offset: 8,
    value: 1
  }, {
    name: 'Sequence Id',
    key: 'seq',
    bytes: 4,
    offset: 12,
    value: 1
  }];

  /**
   * 字符串转化为Byte字节
   * @param {String} str 要转化的字符串
   * @return {Array[byte]} 字节数组
   */
  function str2bytes (str) {
    var bytes = [];
    var c;
    var len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    return bytes
  }

  /**
   * 将字节数组转化为字符串
   * @param {Array[byte]} bytesArray 字节数组
   * @return {String} 字符串
   */
  function bytes2str (array) {
    var bytes = array.slice(0);
    var filterArray = [
      [0x7f],
      [0x1f, 0x3f],
      [0x0f, 0x3f, 0x3f],
      [0x07, 0x3f, 0x3f, 0x3f]
    ];
    var j;
    var str = '';
    for (var i = 0; i < bytes.length; i = i + j) {
      var item = bytes[i];
      var number = '';
      if (item >= 240) {
        j = 4;
      } else if (item >= 224) {
        j = 3;
      } else if (item >= 192) {
        j = 2;
      } else if (item < 128) {
        j = 1;
      }
      var filter = filterArray[j - 1];
      for (var k = 0; k < j; k++) {
        var r = (bytes[i + k] & filter[k]).toString(2);
        var l = r.length;
        if (l > 6) {
          number = r;
          break
        }
        for (var n = 0; n < 6 - l; n++) {
          r = '0' + r;
        }
        number = number + r;
      }
      str = str + String.fromCharCode(parseInt(number, 2));
    }
    return str
  }

  /**
   * 生成对应的消息包
   * @param {Number} action 2是心跳包/7是加入房间
   * @param {String} payload
   */
  function generatePacket (action, payload) {
    if ( action === void 0 ) action = 2;
    if ( payload === void 0 ) payload = '';

    var packet = str2bytes(payload);
    var buff = new ArrayBuffer(packet.length + 16);
    var dataBuf = new DataView(buff);
    dataBuf.setUint32(0, packet.length + 16);
    dataBuf.setUint16(4, 16);
    dataBuf.setUint16(6, 1);
    dataBuf.setUint32(8, action);
    dataBuf.setUint32(12, 1);
    for (var i = 0; i < packet.length; i++) {
      dataBuf.setUint8(16 + i, packet[i]);
    }
    return dataBuf
  }

  var Socket = function Socket (roomid) {
    this.roomid = roomid;
    /* eslint-disable */
    this._docker = new WebSocket(wsUrl$1);
    this._methods = [];
  };

  Socket.prototype.init = function init () {
      var this$1 = this;

    console.log("新的socket正在初始化...");
    this._docker.binaryType = 'arraybuffer';
    this._docker.onopen = function (event) {
      var join = this$1._joinRoom(this$1.roomid);
      this$1._docker.send(join.buffer);
      this$1._sendBeat();
    };

    this._docker.onmessage = function (event) {
      var dataView = new DataView(event.data);
      var packetLen, headerLen;
      var loop = function ( offset$1 ) {
        var data = {};
        packetLen = dataView.getUint32(offset$1);
        headerLen = dataView.getUint16(offset$1 + 4);

        messageStruct.forEach(function (item) {
          if (item.bytes === 4) {
            data[item.key] = dataView.getUint32(offset$1 + item.offset);
          } else if (item.bytes === 2) {
            data[item.key] = dataView.getUint16(offset$1 + item.offset);
          }
        });

        if (data.op && data.op === 5) {
          data.body = [];

          var recData = [];
          for (var i = offset$1 + headerLen; i < offset$1 + packetLen; i++) {
            recData.push(dataView.getUint8(i));
          }
          try {
            data.body = [];
            var body = JSON.parse(bytes2str(recData));
            if (body.cmd === 'DANMU_MSG') {
              console.log(body.info[2][1], ':', body.info[1]);
              this$1._call({
                name: body.info[2][1],
                text: body.info[1]
              });
            }
            data.body.push(body);
          } catch (e) {
            console.log(e);
          }
        }
        offset$1 += packetLen;

          offset = offset$1;
      };

        for (var offset = 0; offset < dataView.byteLength;) loop( offset );
      // console.warn(`该条message携带${result.length}条弹幕`, result)
    };

    this._docker.onclose = function (event) {
      console.log("旧的socket已经关闭...");
    };
  };

  Socket.prototype.addMethods = function addMethods (fns) {
    this._methods = fns;
  };

  Socket.prototype.close = function close () {
    // 清除定时脚本
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this._docker.close();
  };

  /**
   * 执行函数
   */
  Socket.prototype._call = function _call () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

    for (var i = 0, l = this._methods.length; i < l; i++) {
      var fn = this._methods[i];
      if (typeof fn !== 'function') { continue }
      fn.apply(null, args);
    }
  };

  /**
   * 发送加入房价包
   */
  Socket.prototype._joinRoom = function _joinRoom (rid, uid) {
      if ( rid === void 0 ) rid = 282712;
      if ( uid === void 0 ) uid = 19176530;

    var packet = JSON.stringify({
      uid: uid,
      roomid: rid
    });
    return generatePacket(7, packet)
  };

  /**
   * 发送心跳包，表明连接激活
   */
  Socket.prototype._sendBeat = function _sendBeat () {
      var this$1 = this;

    this._timer = setInterval(function () {
      this$1._docker.send(generatePacket());
    }, 30 * 1000);
  };

  /**
   * bilibili房间类
   */
  var Room = function Room (roomid) {
    this.roomid = roomid;
    this.socket = new Socket(roomid);
  };

  Room.prototype._init = function _init () {
    this.socket.init();
  };

  Room.prototype.$start = function $start () {
    console.log(("加入房间" + (this.roomid)));
    this._init();
    return this
  };

  /**
   * 销毁实例
   */
  Room.prototype.$destroy = function $destroy () {
    // 关闭socket
    this.socket.close();
    this.socket = null;

    console.log(("退出房间" + (this.roomid)));
    this.roomid = null;
  };

  Room.prototype.$subscribe = function $subscribe (fn) {
    var fns = Array.isArray(fn) ? fn : [fn];
    this.socket.addMethods(fns);
    return this
  };

  return Room;

}));
//# sourceMappingURL=index.js.map
