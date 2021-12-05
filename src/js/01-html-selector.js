class UiElement { // eslint-disable-line no-unused-vars
	constructor() {
		this.selector = '';
		this.$element = null;
	}


	selectAll(selector) {
		let $elements = [];
		if (typeof selector === 'string') {
			this.selector = selector;
			const $nodes = document.querySelectorAll(selector);
			for (let i = 0; i < $nodes.length; i++) {
				$elements.push($nodes[i]);
			}
		}

		if ($elements.length === 0) {
			console.error(`Could not select elements: ${selector}.`);
		}

		return $elements;
	}


	select(selector) {
		this.$element = null;

		if (typeof selector === 'string') {
			this.selector = selector;
			this.$element = document.querySelector(selector);
		} else if (typeof selector === 'object') {
			this.selector = `${selector}`;
			this.$element = selector;
		}

		if (!this.$element) {
			console.error(`Could not select element: ${selector}.`);
		}

		return this;
	}


	selectParent() {
		if (this.$element === null) {
			console.error('Can not select a parent element, when no element is selected');
		}

		this.$element = this.$element.parentElement;
		if (!this.$element) {
			console.error('Currently selected element has no parrent');
		}

		return this;
	}


	hasClass(className) {
		if (!this.$element) {
			console.warn('Calling hasClass() without selected $element.');
			return false;
		}

		if (!className) {
			console.warn(`Checking ${this.selector} for blank class name.`);
			return false;
		}

		return this.$element.className.indexOf(className) !== -1;
	}


	removeClass(className) {
		if (!this.$element) {
			console.warn('Calling removeClass() without selected $element.');
			return false;
		}

		if (!className) {
			console.warn(`Removing blank class name from ${this.selector}.`);
			return true;
		}

		this.$element.className = this.$element.className.replace(className, '');

		return true;
	}


	addClass(className) {
		if (!this.$element) {
			console.warn('Calling addClass() without selected $element.');
			return false;
		}

		if (!className) {
			console.error(`Adding blank class name to ${this.selector}.`);
			return false;
		}

		if (this.hasClass(className)) {
			return false;
		}

		this.$element.className = this.$element.className.concat(` ${className}`);
		return true;
	}


	addClassAll($elements, className) {
		if (!Array.isArray($elements) && !($elements instanceof NodeList)) {
			console.warn('Calling addClassAll() without selected $elements.');
			return;
		}

		$elements.forEach($e => this.select($e).addClass(className));
	}


	removeClassAll($elements, className) {
		if (!Array.isArray($elements) && !($elements instanceof NodeList)) {
			console.warn('Calling removeClassAll() without selected $elements.');
			return;
		}

		$elements.forEach($e => this.select($e).removeClass(className));
	}


	toggleClass(className) {
		if (!this.addClass(className)) {
			this.removeClass(className);
		}
	}


	getStyle() {
		if (!this.$element) {
			console.warn('Calling getStyle() without selected $element.');
			return {};
		}

		return window.getComputedStyle(this.$element);
	}


	setStyle(newStyle) {
		if (!this.$element) {
			console.warn('Calling setStyle() without selected $element.');
			return;
		}

		if (typeof newStyle !== 'object' && newStyle !== null) {
			console.error(`setStyle() got invalid input. Expecting an object, but got ${typeof newStyle}.`);
			return;
		}

		for (const rule in newStyle) {
			this.$element.style[rule] = newStyle[rule];
		}
	}


	scrollIntoView(options) {
		if (!this.$element) {
			console.warn('No selected $element. Nothing to scroll.');
			return this;
		}

		if (typeof this.$element.scrollIntoView !== 'function') {
			console.error(`Cannot scroll ${this.selector} into view. Function is not supported.`);
			return this;
		}

		this.$element.scrollIntoView(options);

		return this;
	}


	addEventListener(eventType, callback) {
		if (!this.$element) {
			console.warn('Calling addEventListener() without selected $element.');
			return;
		}

		if (typeof callback !== 'function' || typeof eventType !== 'string') {
			console.error(
				`setStyle() got invalid input. Expecting (string, Object), but got (${typeof eventType}, ${typeof callback}).`
			);
			return;
		}

		this.$element.addEventListener(eventType, callback);
	}


	setHTML(newHTML) {
		if (!this.$element) {
			console.warn('Calling setHTML() without selected $element.');
			return;
		}

		if (typeof newHTML !== 'string') {
			console.error(`setHTML() got invalid input. Expecting string, but got ${typeof newHTML}.`);
			return;
		}

		this.$element.innerHTML = newHTML;
	}


	getHTML() {
		if (!this.$element) {
			console.warn('Getting the HTML when there is no selected $element.');
			return '';
		}

		return this.$element.innerHTML;
	}


	getData(attribute) {
		if (!this.$element) {
			console.warn('Getting a data attribute when there is no selected $element.');
			return '';
		}

		return this.$element.getAttribute(`data-${attribute}`);
	}
}
