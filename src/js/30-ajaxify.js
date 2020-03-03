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

		this.select(this.selectors.ajaxLoaderText).setHTML(MESSAGES.loading); // eslint-disable-line no-undef

		this.run();

		window.addEventListener('popstate', event => this._handleHistoryPop(event));

		// Setting the initial state is necessary, because we need the last non-ajax URL,
		// otherwise:
		//   1) it is impossible to use the Back button to exit the site.
		//   2) it is impossible to navigate to any of our non-ajax URLs that are in history.
		history.replaceState(
			{
				scroll: 0,
				title: this.select(this.selectors.title).getHTML(),
				url: location.pathname
			},
			this.select(this.selectors.title).getHTML(),
			location.pathname
		);
		this.lastNavigationUrl = location.pathname;
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
		Ajaxify.select(Ajaxify.selectors.ajaxLoader).addClass(Ajaxify.classes.ajaxLoaderSpinning);
	}


	/**
	 * showSpinner
	 * Hides the ajax loading spinner
	 *
	 * @return {void}
	 */
	hideSpinner() {
		Ajaxify.select(Ajaxify.selectors.ajaxLoader).removeClass(Ajaxify.classes.ajaxLoaderSpinning);
	}


	_handleNavigation(event) {
		event.preventDefault();

		// After navigating, we must also reset the scroll position, because
		// simply replacing the HTML using JS does not mean the browser is going to scroll up for us.
		Ajaxify.navigate(event.currentTarget.getAttribute('href'), true).then(() => window.scrollTo(0, 0));
	}


	_handleHistoryPop(event) {
		if (!event.state || !event.state.url) {
			// onhistorypop is triggered when location.hash changes, but we don't care
			// about that, so we can safely ignore it.
			if (location.hash !== '') {
				console.info('location.hash change. Ignoring navigation request.');
				return;
			} else if (location.href === this.lastNavigationUrl) {
				console.info('Navigation URL is the same as the last one. Nothing to do.')
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
		let links = [...this.selectAll('a')].filter(a => `${a.getAttribute('href')}`.match(/^\/[^/]/));

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
		let links = [...this.selectAll(this.selectors.languageLinks)];

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
		const stateWithScroll = {
			scroll: window.pageYOffset,
			title: history.state.title,
			url: history.state.url
		};
		history.replaceState(stateWithScroll, stateWithScroll.title, stateWithScroll.url);
	}
};
