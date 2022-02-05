const Ajaxify = new class {
	constructor() {
		this.spinnerDelay = 400; // ms
		this.spinnerShowTimeout = 0; // setTimeout() ID
		this.lastNavigationUrl = '';

		this.classes = {
			ajaxLoaderSpinning: 'ajax-loader-spinning',
			disabledBody: 'disabled-body'
		};

		this.selectors = {
			ajaxLoader: '.ajax-loader',
			ajaxLoaderText: '.ajax-loader .label',
			content: '#content-container',
			description: 'meta[name=description]',
			internalLinks: 'a:not([hreflang])[href^="/"]',
			languageLinks: 'a[hreflang][rel=alternate]',
			playlistLinks: '.menu-playlist a[href]',
			title: 'title'
		};

		window.addEventListener('load', () => this._init());
		window.addEventListener('buildPlaylist', () => {
			if (this.isSupported()) {
				this._apply(this.selectors.playlistLinks);
			}
		});
	}


	_init() {
		if (!this.isSupported()) {
			return;
		}

		this._applyToAll();

		window.addEventListener('hashchange', event => this._forceHistoryState(event));
		window.addEventListener('popstate', event => this._handleHistoryPop(event));
		this._forceHistoryState();
	}


	/**
	 * isSupported()
	 *
	 * @param {void}
	 * @return {bool}
	 */
	isSupported() {
		return typeof history !== 'undefined'
			&& typeof history.replaceState === 'function'
			&& typeof history.pushState === 'function'
			&& typeof window.fetch === 'function'
			// Ajaxify is causing too many problems with navigation on older browsers, so
			// here is another way of detecting them
			&& Player.isSupported(); // eslint-disable-line no-undef
	}


	/**
	 * get
	 * Performs a GET request
	 *
	 * @param {string} url
	 * @return {Promise<JSON>}
	 */
	get(url) {
		return fetch(url).then(response =>
			response.ok ? response.json() : Promise.reject(new Error(`${response.status} ${response.statusText}`))
		);
	}


	/**
	 * navigate
	 * Fetches the content for the given URL, parses it, then updates the HTML appropriately.
	 *
	 * @param  {string}  url
	 * @param  {boolean} updateHistory
	 * @return {Promise<void>}
	 */
	navigate(url, updateHistory) {
		// Show the spinner if loading takes too long, for the user to be entertained.
		this.spinnerShowTimeout = setTimeout(Ajaxify.showSpinner, this.spinnerDelay);

		this.lastNavigationUrl = url;

		return this.get(`/api${url}`)
			.then(data => {
				try {
					const { content, description, title, urls } = data;

					if (updateHistory) {
						this._saveScrollPosition();
						this._pushToHistory(url, title);
					}
					this._updatePage(content, description, title, urls);

					clearTimeout(this.spinnerShowTimeout);
					this.hideSpinner();
				} catch (error) {
					throw new Error(`Could not parse backend response for URL: "${url}". ${error}`);
				}
			})
			.catch(error => {
				console.error(`Could not navigate to URL: "${url}". ${error.message}.`);
				console.info('Attempting non-ajax navigation.');
				location.href = url;
			});
	}


	/**
	 * showSpinner
	 * Shows the ajax loading spinner
	 *
	 * @return {void}
	 */
	showSpinner() {
		// eslint-disable-next-line no-undef
		new UiElement().select(Ajaxify.selectors.ajaxLoaderText).setHTML(MESSAGES.loading);
		new UiElement().select(Ajaxify.selectors.ajaxLoader).addClass(Ajaxify.classes.ajaxLoaderSpinning);
	}


	/**
	 * showSpinner
	 * Hides the ajax loading spinner
	 *
	 * @return {void}
	 */
	hideSpinner() {
		new UiElement().select(Ajaxify.selectors.ajaxLoader).removeClass(Ajaxify.classes.ajaxLoaderSpinning);
		setTimeout(
			// this is to avoid hiding the text before the css animation has finished
			() => new UiElement().select(Ajaxify.selectors.ajaxLoaderText).setHTML(''),
			5000
		);
	}


	/**
	 * _applyToAll
	 * Ajaxifies all internal relative links
	 *
	 * @param {void}
	 * @return {void}
	 */
	_applyToAll() {
		this
			._apply(this.selectors.internalLinks)
			._apply(this.selectors.languageLinks);
	}


	/**
	 * apply
	 * Ajaxifies links by a given CSS selector
	 *
	 * @param {string} selector
	 * @return {this}
	 */
	_apply(selector) {
		this._getLinks(selector).forEach(a => {
			a.removeEventListener('click', this._handleNavigation);
			a.addEventListener('click', this._handleNavigation);
		});

		return this;
	}


	_handleNavigation(event) {
		event.preventDefault();

		if (new UiElement().select('body').hasClass(Ajaxify.classes.disabledBody)) {
			return;
		}

		// After navigating, we must also reset the scroll position, because
		// simply replacing the HTML using JS does not mean the browser is going to scroll up for us.
		Ajaxify.navigate(event.currentTarget.getAttribute('href'), true).then(() => window.scrollTo(0, 0));
	}


	/**
	 * _forceHistoryState
	 * Handle hash changes and initial (non-ajax) navigation. In these cases there is no
	 * event.state (history state), so we have to generate one, in order not to break
	 * navigating back to this entry. This also covers the case when the user wants to use
	 * "Back" to navigate out of the site.
	 *
	 * @return {void}
	 */
	_forceHistoryState() {
		const url = `${location.pathname}${location.hash}`;

		let title = new UiElement().select(this.selectors.title).getHTML();
		if (location.hash !== '') {
			title = `${location.hash} | ${title}`;
		}

		history.replaceState(
			{ scroll: window.pageYOffset, title, url },
			title,
			url
		);
		this.lastNavigationUrl = location.pathname;

		console.info(`Forced history URL: "${url}".`);
	}



	_handleHistoryPop(event) {
		if (!event.state || !event.state.url) {
			// We don't care, if:
			//   1) location.hash has changed (it triggers history change)
			//   2) we are navigating to the same URL (excluding the hash)
			if (location.pathname === this.lastNavigationUrl) {
				console.info('Navigation URL is the same as the last one. Nothing to do.');
				if (location.hash !== '') {
					console.info('location.hash change ignored.');
				}
				return;
			}

			// ... or else, we are navigating out of the site.
		}

		try {
			Ajaxify.navigate(event.state.url).then(() => window.scrollTo(0, event.state.scroll));
		} catch (error) {
			console.warn(`Navigating normally. The previous URL is not available in popstate event data. ${error}`);
			history.back();
		}
	}


	_handleLanguageChange(event) {
		if (!PlayerUi.isPlaying()) { // eslint-disable-line no-undef
			return;
		}

		if (!confirm(MESSAGES.newLanguageWillInterruptMusic)) { // eslint-disable-line no-undef
			event.preventDefault();
		}
	}


	/**
	 * _getLinks
	 * Returns an array of links matching the provided CSS selector.
	 *
	 * @param {string} selector
	 * @return {<HtmlNode>[]}
	 */
	_getLinks(selector) {
		if (typeof selector !== 'string') {
			return [];
		}

		let links = new UiElement().selectAll(selector);

		if (typeof AJAXIFY_EXCLUDE !== 'undefined' && Array.isArray(AJAXIFY_EXCLUDE)) { // eslint-disable-line no-undef
			const excludePattern = new RegExp(AJAXIFY_EXCLUDE.join('|')); // eslint-disable-line no-undef
			links = links.filter(a => !`${a.getAttribute('href')}`.match(excludePattern));
		}

		return links;
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
		new UiElement().select(this.selectors.content).setHTML(content);
		new UiElement().select(this.selectors.title).setHTML(title);
		if (typeof description === 'string') {
			new UiElement().select(this.selectors.description).setAttribute('content', description);
		}

		if (Array.isArray(urls)) {
			const languageLinks = this._getLinks(this.selectors.languageLinks);
			urls.forEach(({ url, language_code }) => {
				const $a = languageLinks.find(a => a.hreflang === language_code);
				if ($a) {
					$a.setAttribute('href', url);
				}
			});
		}

		// ajaxify any new links
		this._applyToAll();
	}


	/**
	 * _pushToHistory
	 * Changes the browser URL and title, without navigating.
	 *
	 * @param  {string} url
	 * @param  {string} title
	 * @return {void}
	 */
	_pushToHistory(url, title) {
		history.pushState({ scroll: 0, title, url }, title, url);
	}


	/**
	 * _saveScrollPosition
	 * Saves the current scroll position for the current URL, so that we can restore it when we navigate back.
	 *
	 * @return {void}
	 */
	_saveScrollPosition() {
		try {
			if (location.hash !== '') {
				console.warn('location.hash is not empty. NOT saving scroll position.');
				return;
			}

			const stateWithScroll = {
				scroll: window.pageYOffset,
				title: history.state.title,
				url: history.state.url
			};
			history.replaceState(stateWithScroll, stateWithScroll.title, stateWithScroll.url);
		} catch (error) {
			console.warn(`Failed saving scroll position. ${error}`);
		}
	}
};
