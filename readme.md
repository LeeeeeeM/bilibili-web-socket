# 目前只是web通过websocket链接

**之后还会带来server通过tcp和websocket协议链接**

**web版不同于server版本（需要通过Buffer来传输二进制数据），web版本必须走ArrayBuffer**

## 请打开控制台，接受弹幕  目前用原生的ws实现，建议使用chrome浏览器

[demo地址](https://evilemon.github.io/bilibili-web-socket/)

## 特别提醒，尽量进一个比较火的直播房间 (⊙﹏⊙)b 有的很冷清半天看不到一个弹幕

[B站直播网址](https://live.bilibili.com/)

##  这个房间稳定有弹幕 5279

## 最新更新 => 通过进行nginx代理，通过我的域名转发到bilibili弹幕ws服务上

[wss://api.energys.cn/sub](wss://api.energys.cn/sub)


