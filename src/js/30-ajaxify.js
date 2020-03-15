const Ajaxify = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.spinnerDelay = 400; // ms
		this.spinnerShowTimeout = 0; // setTimeout() ID
		this.lastNavigationUrl = '';

		this.classes = { ajaxLoaderSpinning: 'ajax-loader-spinning'	};

		this.selectors = {
			ajaxLoader: '.ajax-loader',
			ajaxLoaderText: '.ajax-loader .label',
			content: '.content-wrapper',
			description: 'meta[name=description]',
			languageLinks: 'a[hreflang][rel=alternate]',
			title: 'title'
		};

		window.addEventListener('load', () => this._init());
	}


	_init() {
		if (typeof axios === 'undefined') {
			console.error('Failed initializing Ajaxify. Axios is not available.');
			return;
		}

		// Ajaxify is causing too much problems with navigation on older browsers so it is better to
		// disable it.
		if (!Player.isSupported() || !this.isSupported()) { // eslint-disable-line no-undef
			return;
		}

		this.run();

		window.addEventListener('hashchange', event => this._forceHistoryState(event));
		window.addEventListener('popstate', event => this._handleHistoryPop(event));
		this._forceHistoryState();
	}


	isSupported() {
		return typeof history !== 'undefined'
			&& typeof history.replaceState === 'function'
			&& typeof history.pushState === 'function';
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
	 * @param  {string}  url
	 * @param  {boolean} updateHistory
	 * @return {Promise<void>}
	 */
	navigate(url, updateHistory) {
		// Show the spinner if loading takes too long, for the user to be entertained.
		this.spinnerShowTimeout = setTimeout(Ajaxify.showSpinner, this.spinnerDelay);

		this.lastNavigationUrl = url;

		return axios.get(`/api${url}`) // eslint-disable-line no-undef
			.then(response => {
				try {
					const { content, description, title, urls } = response.data;

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
				console.error(`Could not navigate to URL: "${url}". ${error}.`);
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
		this.select(this.selectors.ajaxLoaderText).setHTML(MESSAGES.loading); // eslint-disable-line no-undef
		Ajaxify.select(Ajaxify.selectors.ajaxLoader).addClass(Ajaxify.classes.ajaxLoaderSpinning);
	}


	/**
	 * showSpinner
	 * Hides the ajax loading spinner
	 *
	 * @return {void}
	 */
	hideSpinner() {
		this.select(this.selectors.ajaxLoaderText).setHTML('');
		Ajaxify.select(Ajaxify.selectors.ajaxLoader).removeClass(Ajaxify.classes.ajaxLoaderSpinning);
	}


	_handleNavigation(event) {
		event.preventDefault();

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

		let title = this.select(this.selectors.title).getHTML();
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
	 * _getInternalLinks
	 *
	 * @return {<HtmlNode>[]}  An array of all relative links
	 */
	_getInternalLinks() {
		let links = this.selectAll('a').filter(a => `${a.getAttribute('href')}`.match(/^\/[^/]/));

		if (typeof AJAXIFY_EXCLUDE !== 'undefined' && Array.isArray(AJAXIFY_EXCLUDE)) { // eslint-disable-line no-undef
			const excludePattern = new RegExp(AJAXIFY_EXCLUDE.join('|')); // eslint-disable-line no-undef
			links = links.filter(a => !`${a.getAttribute('href')}`.match(excludePattern));
		}

		return links;
	}


	/**
	 * _getLanguageLinks
	 *
	 * @return {<HtmlNode>[]}  An array of all language change links
	 */
	_getLanguageLinks() {
		let links = this.selectAll(this.selectors.languageLinks);

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
		this.select(this.selectors.content).setHTML(content);
		this.select(this.selectors.title).setHTML(title);
		if (typeof description === 'string' && this.select(this.selectors.description)) {
			this.$element.setAttribute('content', description);
		}

		if (Array.isArray(urls)) {
			const languageLinks = this._getLanguageLinks();
			urls.forEach(({ url, language_code }) => {
				const $a = languageLinks.find(a => a.hreflang === language_code);
				if ($a) {
					$a.setAttribute('href', url);
				}
			});
		}


		// ajaxify any new links
		this.run();
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
