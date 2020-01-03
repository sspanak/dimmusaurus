const Menu = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.closedMenuClass = 'menu-closed';
		this.selectedButtonClass = 'selected';
		this.selectors = {
			language: '.menu-language-choice',
			languageButton: '.toggle-language-wrapper a',
			main: '.menu-main',
			mainButton: '.toggle-main-menu-wrapper a',
			music: '.menu-music',
			playlist: '.menu-playlist-wrapper'
		};
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


	togglePlaylist() {
		this.select(this.selectors.playlist).toggleClass(this.closedMenuClass);
	}
};
