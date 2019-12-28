function selectElement(selector) {
	return typeof selector === 'object' ? selector : document.querySelector(selector);
}


function hasClass(selector, className) {
	const $element = selectElement(selector);
	if (!$element) {
		return false;
	}

	return $element.className.indexOf(className) !== -1;
}


function removeClass(selector, className) {
	const $element = selectElement(selector);
	if (!$element) {
		return false;
	}

	$element.className = $element.className.replace(className, '');

	return true;
}


function addClass(selector, className) {
	const $element = selectElement(selector);
	if (!$element || hasClass(selector, className)) {
		return false;
	}

	$element.className = $element.className.concat(` ${className}`);
	return true;
}


function toggleClass(selector, className) {
	if (!addClass(selector, className)) {
		removeClass(selector, className);
	}
}


function togglePlaylist() {
	toggleClass('.menu-playlist-wrapper', 'menu-closed');
}

function toggleMute() {
	$element = selectElement('.player-controls .volume')
	if (hasClass($element, 'fa-volume-up')) {
		removeClass($element, 'fa-volume-up');
		addClass($element, 'fa-volume-mute');
	} else {
		removeClass($element, 'fa-volume-mute');
		addClass($element, 'fa-volume-up');
	}

	console.log('toggle volume');
}
