var dom = window.document
var room = new BILIWS(4350043)
room.$start().$subscribe(addDanMu)
document.getElementById('btn').addEventListener('click', function () {
  var number = document.getElementById('input').value
  if (number) {
    if (/^\d+$/.test(number)) {
      room.$destroy()
      room = new BILIWS(Number(number))
      room.$start().$subscribe(addDanMu)
    }
  }
})

function addDanMu (res) {
  var div = dom.createElement('div')
  div.setAttribute('class', 'danmu')
  div.innerText = new Date().toLocaleTimeString() + ' $ ' + res.name + '   :   ' + res.text
  document.body.appendChild(div)
}
