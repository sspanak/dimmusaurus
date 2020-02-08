const Ajaxify = new class extends UiElement { // eslint-disable-line

	constructor() {
		super();

		this.selectors = {
			content: '.content-wrapper',
			description: 'meta[name=description]',
			title: 'title'
		};

		if (Player.isSupported()) { // eslint-disable-line no-undef
			this.run();
		}
	}


	/**
	 * run
	 *
	 * Ajaxifies all internal relative links
	 */
	run() {
		this._getInternalLinks().forEach(a => {
			a.removeEventListener('click', this._handleNavigation);
			a.addEventListener('click', this._handleNavigation);
		});

		this._getLanguageLinks().forEach(a => {
			a.removeEventListener('click', this._handleLanguageChange);
			a.addEventListener('click', this._handleLanguageChange);
		});
	}


	/**
	 * navigate
	 * Fetches the content for the given URL, parses it, then updates the HTML appropriately.
	 *
	 * @param  {string} url
	 * @return {Promise<void>}
	 */
	navigate(url) {
		axios.request({ // eslint-disable-line no-undef
			headers: { Accept: 'application/json' },
			method: 'GET',
			url
		})
			.then(response => {
				try {
					const { content, description, title, urls } = response.data;
					this._updatePage(content, description, title, urls);
				} catch (error) {
					throw new Error(`Could not parse backend response for URL: "${url}". ${error}`);
				}
			})
			.catch(error => {
				if (typeof Logger !== 'undefined') {
					Logger.error(`Could not navigate to URL: "${url}". ${error}.`);
				} else {
					location.href = url;
				}
			});
	}


	_handleNavigation(event) {
		event.preventDefault();
		Ajaxify.navigate(event.currentTarget.getAttribute('href'));
	}


	_handleLanguageChange(event) {
		if (!PlayerUi.isPlaying()) {
			return;
		}

		if (!confirm(PLAYER_MSG.newLanguageWillInterruptMusic)) {
			event.preventDefault();
		}
	}


	/**
	 * _getInternalLinks
	 *
	 * @return {<HtmlNode>[]}  An array of all relative links
	 */
	_getInternalLinks() {
		return [...this.selectAll('a')].filter(a => `${a.getAttribute('href')}`.match(/^\/[^/]/));
	}


	/**
	 * _getLanguageLinks
	 *
	 * @return {<HtmlNode>[]}  An array of all language change links
	 */
	_getLanguageLinks() {
		return [...this.selectAll('a')].filter(
			a => a.getAttribute('hreflang') !== null && `${a.getAttribute('hreflang')}`.length > 0
		);
	}


	/**
	 * _updatePage
	 * Updates page elements with new ones
	 *
	 * @param  {string} 	content
	 * @param  {string} 	description
	 * @param  {string} 	title
	 * @param	 {string[]} urls
	 * @return {void}
	 */
	_updatePage(content, description, title, urls) {
		this.select(this.selectors.content).setHTML(content);
		this.select(this.selectors.title).setHTML(title);
		if (typeof description === 'string' && this.select(this.selectors.description)) {
			this.$element.setAttribute('content', description);
		}

		// @todo: update all a.hreflang

		// ajaxify any new links
		this.run();
	}
};
