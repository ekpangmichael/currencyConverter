const STATIC_CACHE_NAME = 'static-v14';
const DYNAMIC_CACHE_NAME = 'dynamic2';
const STATIC_ASSETS = [
			'./',
			'index.html',
			'css/flags.css',
			'css/select2.css',
			'css/styles.css',
			'https://fonts.googleapis.com/css?family=Open+Sans:400,600,700',
			'https://fonts.googleapis.com/css?family=Glegoo',
			'img/header-bg.png',
			'js/app.js',
			'js/collapsible.js',
			'js/fetch.js',
			'js/promise.js',
			'js/select2.min.js',
			'libs/jquery.min.js'
];

//function to trim cache 
function trimCache(cacheName, maxItems) {
	caches.open(cacheName)
		.then(cache => {
			return cache.keys()
			.then(keys => {
			if(keys.length > maxItems){
				cache.delete(keys[0])
				.then(trimCache(cacheName, maxItems));
			}
		});
		})
		
}
self.addEventListener('install', event => {
console.log('[service worker] Installing services worker.', event)
event.waitUntil(caches.open(STATIC_CACHE_NAME)
.then(cache => {
    console.log('[service worker] Precaching App');
    cache.addAll(STATIC_ASSETS);
}))
});

self.addEventListener('activate', event => {
console.log('[service worker] Activating services worker...', event);
event.waitUntil(caches.keys()
    .then(keyList => {
        return Promise.all(keyList.map(key => {
            if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME){
            console.log('[dervice worker] removing old cache', key);
            return caches.delete(key);
        }
        }));

    }));
return self.clients.claim();
});

//function to check the array of caches for match
function isInArray(string, array) {
	for (let i = 0; i < array.length; i++){
		if(array[i]===string){
			return true;
		}
	}
	return false;
}
self.addEventListener('fetch', event => {
	const url = `https://free.currencyconverterapi.com/`;

	if(event.request.url.indexOf(url)>-1){

event.respondWith(caches.open(DYNAMIC_CACHE_NAME)
.then(cache => {
    return fetch(event.request)
    .then(res => {
        //trimcache
        trimCache(DYNAMIC_CACHE_NAME, 100);
        cache.put(event.request, res.clone());
        return res;
    });
}));
// check if we are loading the static assets
	}else if(isInArray(event.request.url, STATIC_ASSETS)){
		event.respondWith(caches.match(event.request));
	}else {

		event.respondWith(caches.match(event.request)
		.then(response => {
			if(response){
				return response;
			}else {
				return fetch(event.request)
				.then(res => {
					return caches.open(DYNAMIC_CACHE_NAME)
					.then(cache => {
						//trimcache
						trimCache(DYNAMIC_CACHE_NAME, 100);
						cache.put(event.request.url, res.clone())
						return res;
					})
				});

			}
		}));
	}


});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});