const Menu = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.scrollToTopHideTimeout = -1;

		this.classes = {
			closedMenu: 'menu-closed',
			hidden: 'hidden',
			selected: 'selected'
		};
		this.selectors = {
			content: '#content-container',
			headerSuperWrapper: '.header-super-wrapper',
			language: '.menu-language-choice',
			languageButton: '#language-menu-button',
			main: '.menu-main',
			mainButton: '#main-menu-button',
			music: '.menu-music',
			musicButton: '#music-button',
			scrollToTop: '#scroll-to-top-button',
			theme: '.menu-theme-choice',
			themeButton: '#theme-menu-button'
		};

		this._init();
	}


	_init() {
		window.addEventListener('load', () => {
			this.select(this.selectors.languageButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.closeOthers(this.selectors.language).toggleMenuLanguage();
			});

			this.select(this.selectors.mainButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.closeOthers(this.selectors.main).toggleMenuMain();
			});

			this.select(this.selectors.musicButton).addEventListener('click', (event) => {
				event.stopPropagation();

				PlayerUi.closePlaylist(); // eslint-disable-line no-undef
				this
					.closeMenuLanguage()
					.closeMenuTheme()
					.toggleMenuMusic();
			});

			this.select(this.selectors.themeButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.closeOthers(this.selectors.theme).toggleMenuTheme();
			});

			// close all
			this.select(this.selectors.headerSuperWrapper).addEventListener('click', (event) => {
				event.stopPropagation();
				this.closeAll();
			});
			this.select(this.selectors.content).addEventListener('click', () => {
				this.closeAll();
			});

			// close menus with Escape
			document.addEventListener('keyup', event => {
				if ('code' in event && event.code === 'Escape') {
					this.closeAll();
				}
			});

			// show scroll to top button while scrolling
			document.addEventListener('scroll', () => {
				// show the button only after scrolling 4 screen heights and scrolling up
				if (window.pageYOffset >= window.innerHeight * 4) {
					clearTimeout(this.scrollToTopHideTimeout);
					this.showButtonScrollToTop();
					this.scrollToTopHideTimeout = setTimeout(Menu.hideButtonScrollToTop, 1700);
				} else {
					this.hideButtonScrollToTop();
				}
			});
		});
	}


	closeAll() {
		PlayerUi.closePlaylist(); // eslint-disable-line no-undef
		return this.closeMenuLanguage()
			.closeMenuMain()
			.closeMenuMusic()
			.closeMenuTheme();
	}


	closeOthers(menuName) {
		if (menuName !== this.selectors.language) {
			this.closeMenuLanguage();
		}

		if (menuName !== this.selectors.main) {
			this.closeMenuMain();
		}

		if (menuName !== this.selectors.music) {
			this.closeMenuMusic();
		}

		if (menuName !== this.selectors.theme) {
			this.closeMenuTheme();
		}

		PlayerUi.closePlaylist(); // eslint-disable-line no-undef

		return this;
	}


	closeMenuLanguage() {
		this.select(this.selectors.language).addClass(this.classes.closedMenu);
		this.select(this.selectors.languageButton).removeClass(this.classes.selected);

		return this;
	}


	closeMenuMain() {
		this.select(this.selectors.main).addClass(this.classes.closedMenu);
		this.select(this.selectors.mainButton).removeClass(this.classes.selected);

		return this;
	}


	closeMenuMusic() {
		this.select(this.selectors.music).addClass(this.classes.closedMenu);

		return this;
	}

	closeMenuTheme() {
		this.select(this.selectors.theme).addClass(this.classes.closedMenu);
		this.select(this.selectors.themeButton).removeClass(this.classes.selected);

		return this;
	}


	toggleMenuLanguage() {
		this.select(this.selectors.language).toggleClass(this.classes.closedMenu);

		if (this.hasClass(this.classes.closedMenu)) {
			this.select(this.selectors.languageButton).removeClass(this.classes.selected);
		} else {
			this.select(this.selectors.languageButton).addClass(this.classes.selected);
		}
	}


	toggleMenuMain() {
		this.select(this.selectors.main).toggleClass(this.classes.closedMenu);

		if (this.hasClass(this.classes.closedMenu)) {
			this.select(this.selectors.mainButton).removeClass(this.classes.selected);
		} else {
			this.select(this.selectors.mainButton).addClass(this.classes.selected);
		}
	}


	toggleMenuMusic() {
		this.select(this.selectors.music).toggleClass(this.classes.closedMenu);
	}


	toggleMenuTheme() {
		this.select(this.selectors.theme).toggleClass(this.classes.closedMenu);

		if (this.hasClass(this.classes.closedMenu)) {
			this.select(this.selectors.themeButton).removeClass(this.classes.selected);
		} else {
			this.select(this.selectors.themeButton).addClass(this.classes.selected);
		}
	}


	showButtonScrollToTop() {
		this.select(this.selectors.scrollToTop).removeClass(this.classes.hidden);
	}


	hideButtonScrollToTop() {
		Menu.select(Menu.selectors.scrollToTop).addClass(Menu.classes.hidden);
	}
};
