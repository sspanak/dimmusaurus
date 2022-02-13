function isAncientBrowser() {
	'use strict';

	try {
		if (!('userAgent' in navigator)) return false;
		if (navigator.userAgent.indexOf('Edge') !== -1 && navigator.userAgent.match(/Edge\/(\d+)/)[1] < 16) return true;
		if (!window.CSS.supports('(--var: 0)')) return true;
		if (typeof Symbol === 'undefined') return true;
		eval('class C {}');
		eval('var a=(x) => x+1');
	} catch (e) {
		return true;
	}

	return false;
}

function isOldBrowser() {
	'use strict';

	try {
		if (!String.prototype.padStart || !Number.isNaN || !Number.parseInt || !Number.parseFloat) return true;
		// Firefox < 52 / KaiOS 2.x cannot interpret "const" inside "for..in"
		eval('for (const _ in []){}');
	} catch (e) {
		return true;
	}

	return false;
}

function loadResources(jsPath, legacyJsPath, legacyCssPath) {
	if (isAncientBrowser()) {
		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = legacyCssPath;
		document.head.appendChild(css);
	}

	var js = document.createElement('script');
	js.defer = 'defer';
	js.src = isOldBrowser() ? legacyJsPath : jsPath;
	document.head.appendChild(js);
}
