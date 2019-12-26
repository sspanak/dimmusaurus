function toggleClass(selector, className) {
	const $element = typeof selector === 'object' ? selector : document.querySelector(selector);
	if (!$element) {
		return;
	}

	if ($element.className.indexOf(className) === -1) {
		$element.className = $element.className.concat(` ${className}`);
	} else {
		$element.className = $element.className.replace(className, '');
	}
}
