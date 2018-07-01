if(!window.Promise){
	window.Promise = Promise;
}

if('serviceWorker' in navigator){
	navigator.serviceWorker.register('./sw.js')
	.then(() => {
		console.log('Service Worker Register');
	}).catch(err => {
		console.log(err);
	});
}