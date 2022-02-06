/**
 * String.prototype.padStart() polyfill
 * https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
 */
if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(length, str) {
		let targetLength = length>>0; //truncate if number or convert non-number to 0;
		let padString = String((typeof str !== 'undefined' ? str : ' '));

		if (this.length > targetLength) {
			return String(this);
		} else {
			targetLength = targetLength-this.length;
			if (targetLength > padString.length) {
				//append to original to ensure we are longer than needed
				padString += padString.repeat(targetLength/padString.length);
			}
			return padString.slice(0,targetLength) + String(this);
		}
	};
}

/**
 * Number.isNaN polyfil
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
 */
Number.isNaN = Number.isNaN || function isNaN(input) {
	return typeof input === 'number' && input !== input; // eslint-disable-line no-self-compare
};

/**
 * Number.parseInt
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt
 */
if (Number.parseInt === undefined) {
	Number.parseInt = window.parseInt;
}

/**
 * Number.parseFloat
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat
 */
if (Number.parseFloat === undefined) {
	Number.parseFloat = parseFloat;
}
