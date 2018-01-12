var a = {
	name: 'slm',
	then: then
}

/// 需求 a.then(funtion(res) {
///  // do
/// })
/// 
function then(fn) {
	fn.call(this, this.name)
}

// fn.call(this, arguments)
// 
a.then(function(res) {
	console.log(res)
})