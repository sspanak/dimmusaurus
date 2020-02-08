const Ajaxify = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.selectors = {
			content: '.content-wrapper',
			description: 'meta[name=description]',
			languageLinks: 'a[hreflang][rel=alternate]',
			robotLinks: 'link[hreflang][rel=alternate]',
			title: 'title'
		};

		if (Player.isSupported()) { // eslint-disable-line no-undef
			this._removeBotLinks();
			this.run();

			window.addEventListener('popstate', event => this._handleHistoryPop(event));
			history.replaceState(
				// Setting the initial state is necessary, because
				// we can use only event.state.url, that we set below, to get back here.
				{ url: location.pathname },
				this.select(this.selectors.title).getHTML(),
				location.pathname
			);
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
	 * @param  {string}  url
	 * @param  {boolean} updateHistory
	 * @return {Promise<void>}
	 */
	navigate(url, updateHistory) {
		return axios.request({ // eslint-disable-line no-undef
			headers: { Accept: 'application/json' },
			method: 'GET',
			url
		})
			.then(response => {
				try {
					const { content, description, title, urls } = response.data;
					this._updatePage(content, description, title, urls);
					if (updateHistory) {
						this._updateHistory(url, title);
					}
				} catch (error) {
					throw new Error(`Could not parse backend response for URL: "${url}". ${error}`);
				}
			})
			.catch(error => {
				if (typeof Logger !== 'undefined') {
					Logger.error(`Could not navigate to URL: "${url}". ${error}.`); // eslint-disable-line no-undef
				} else {
					location.href = url;
				}
			});
	}


	_handleNavigation(event) {
		event.preventDefault();
		Ajaxify.navigate(event.currentTarget.getAttribute('href'), true);
	}


	_handleHistoryPop(event) {
		try {
			Ajaxify.navigate(event.state.url);
		} catch (error) {
			Logger.warning(`Navigating normally. The previous URL is not available in popstate event data. ${error}`); // eslint-disable-line no-undef, max-len
			history.back();
		}
	}


	_handleLanguageChange(event) {
		if (!PlayerUi.isPlaying()) { // eslint-disable-line no-undef
			return;
		}

		if (!confirm(PLAYER_MSG.newLanguageWillInterruptMusic)) { // eslint-disable-line no-undef
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
		return [...this.selectAll(this.selectors.languageLinks)];
	}


	/**
	 * _removeBotLinks
	 * Removes the language <link> tags. They are for robot use, so we don't need them in ajax mode.
	 *
	 * @return {void}
	 */
	_removeBotLinks() {
		[...this.selectAll(this.selectors.robotLinks)].forEach(l => l.remove());
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
	 * _updateHistory
	 * Changes the browser URL and title, without navigating.
	 *
	 * @param  {string} url
	 * @param  {string} title
	 * @return {void}
	 */
	_updateHistory(url, title) {
		history.pushState({ url }, title, url);
	}
};
