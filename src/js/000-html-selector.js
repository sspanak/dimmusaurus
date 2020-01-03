class UiElement { // eslint-disable-line no-unused-vars
	constructor() {
		this.$element = null;
	}


	select(selector) {
		this.$element = typeof selector === 'object' ? selector : document.querySelector(selector);

		return this;
	}


	hasClass(className) {
		if (!this.$element) {
			return false;
		}

		return this.$element.className.indexOf(className) !== -1;
	}


	removeClass(className) {
		if (!this.$element) {
			return false;
		}

		this.$element.className = this.$element.className.replace(className, '');

		return true;
	}


	addClass(className) {
		if (!this.$element || this.hasClass(className)) {
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
}
