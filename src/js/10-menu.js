const Menu = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.closedMenuClass = 'menu-closed';
		this.selectedButtonClass = 'selected';
		this.selectors = {
			content: '.content-wrapper',
			headerSuperWrapper: '.header-super-wrapper',
			language: '.menu-language-choice',
			languageButton: '#language-menu-button',
			main: '.menu-main',
			mainButton: '#main-menu-button',
			music: '.menu-music',
			musicButton: '#music-button',
			playlist: '.menu-playlist-wrapper'
		};

		this._init();
	}


	_init() {
		window.addEventListener('load', () => {
			this.select(this.selectors.languageButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.toggleMenuLanguage();
			});

			this.select(this.selectors.mainButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.toggleMenuMain();
			});

			this.select(this.selectors.musicButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.toggleMenuMusic();
			});

			// close all
			this.select(this.selectors.headerSuperWrapper).addEventListener('click', (event) => {
				event.stopPropagation();
				this.closeAll();
			});
			this.select(this.selectors.content).addEventListener('click', () => {
				this.closeAll();
			});
		});
	}


	closeAll() {
		this.select(this.selectors.language).addClass(this.closedMenuClass);
		this.select(this.selectors.main).addClass(this.closedMenuClass);
		this.select(this.selectors.music).addClass(this.closedMenuClass);
		this.select(this.selectors.playlist).addClass(this.closedMenuClass);

		this.select(this.selectors.languageButton).removeClass(this.selectedButtonClass);
		this.select(this.selectors.mainButton).removeClass(this.selectedButtonClass);
	}


	toggleMenuLanguage() {
		this.select(this.selectors.language).toggleClass(this.closedMenuClass);

		if (this.hasClass(this.closedMenuClass)) {
			this.select(this.selectors.languageButton).removeClass(this.selectedButtonClass);
		} else {
			this.select(this.selectors.languageButton).addClass(this.selectedButtonClass);
		}
	}


	toggleMenuMain() {
		this.select(this.selectors.main).toggleClass(this.closedMenuClass);

		if (this.hasClass(this.closedMenuClass)) {
			this.select(this.selectors.mainButton).removeClass(this.selectedButtonClass);
		} else {
			this.select(this.selectors.mainButton).addClass(this.selectedButtonClass);
		}
	}


	toggleMenuMusic() {
		this.select(this.selectors.music).toggleClass(this.closedMenuClass);
	}
};
