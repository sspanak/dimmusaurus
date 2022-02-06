function isOldBrowser() {
	'use strict';

	try {
		if (!('userAgent' in navigator)) return false;
		if (navigator.userAgent.indexOf('Edge') !== -1 && navigator.userAgent.match(/Edge\/(\d+)/)[1] < 16) return true;
		if (typeof Symbol === 'undefined') return true;
		eval('class C {}');
		eval('var a = (x) => x+1');
		eval('for (const _ in []){}'); // Firefox < 52 / KaiOS 2.x cannot interpret "const" inside "for..in"
		if (!String.prototype.padStart || !Number.isNaN || !Number.parseInt || !Number.parseFloat) return true;
	} catch (e) {
		return true;
	}

	return false;
}

function loadResources(jsPath, legacyJsPath, legacyCssPath) {
	var js = document.createElement('script');
	js.defer = 'defer';

	if (isOldBrowser()) {
		js.src = legacyJsPath;

		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = legacyCssPath;
		document.head.appendChild(css);
	} else {
		js.src = jsPath;
	}

	document.head.appendChild(js);
}
