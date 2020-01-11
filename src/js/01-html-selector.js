/* eslint no-undef: 0 */ // to make it shut up about Logger.

class UiElement { // eslint-disable-line no-unused-vars
	constructor() {
		this.selector = '';
		this.$element = null;
	}


	select(selector) {
		if (typeof selector === 'string') {
			this.selector = selector;
			this.$element = document.querySelector(selector);
		} else if (typeof selector === 'object') {
			this.selector = `${selector}`;
			this.$element = selector;
		}

		if (!this.$element) {
			Logger.error(`Could not select element ${selector}.`);
		}

		return this;
	}


	hasClass(className) {
		if (!this.$element) {
			Logger.warn('Calling hasClass() without selected $element.');
			return false;
		}

		if (!className) {
			Logger.warn(`Checking ${this.selector} for blank class name.`);
			return false;
		}

		return this.$element.className.indexOf(className) !== -1;
	}


	removeClass(className) {
		if (!this.$element) {
			Logger.warn('Calling removeClass() without selected $element.');
			return false;
		}

		if (!className) {
			Logger.warn(`Removing blank class name from ${this.selector}.`);
			return true;
		}

		this.$element.className = this.$element.className.replace(className, '');

		return true;
	}


	addClass(className) {
		if (!this.$element) {
			Logger.warn('Calling addClass() without selected $element.');
			return false;
		}

		if (!className) {
			Logger.error(`Adding blank class name to ${this.selector}.`);
			return false;
		}

		if (this.hasClass(className)) {
			return false;
		}

		this.$element.className = this.$element.className.concat(` ${className}`);
		return true;
	}


	toggleClass(className) {
		if (!this.addClass(className)) {
			this.removeClass(className);
		}
	}


	hide() {
		return this.setStyle({ display: 'none' });
	}


	getStyle() {
		if (!this.$element) {
			Logger.warn('Calling getStyle() without selected $element.');
			return {};
		}

		return window.getComputedStyle(this.$element);
	}


	setStyle(newStyle) {
		if (!this.$element) {
			Logger.warn('Calling setStyle() without selected $element.');
			return;
		}

		if (typeof newStyle !== 'object' && newStyle !== null) {
			Logger.error(`setStyle() got invalid input. Expecting an object, but got ${typeof newStyle}.`);
			return;
		}

		// we don't use ... operator, since we are aiming for older browsers here
		for (const rule in newStyle) {
			this.$element.style[rule] = newStyle[rule];
		}
	}

	addEventListener(eventType, callback) {
		if (!this.$element) {
			Logger.warn('Calling addEventListener() without selected $element.');
			return;
		}

		if (typeof callback !== 'function' || typeof eventType !== 'string') {
			Logger.error(
				`setStyle() got invalid input. Expecting (string, Object), but got (${typeof eventType}, ${typeof callback}).`
			);
			return;
		}

		this.$element.addEventListener(eventType, callback);
	}
}