if (typeof window !== 'undefined') {
	let c = localStorage.getItem('nickname');
	if (c === '__undefined__' || c === null || c === undefined || c === 'null') {
		console.log('login require');
	} else {
		document.getElementById('__nickname__').innerText = localStorage.getItem('nickname') || '';
	}
}
