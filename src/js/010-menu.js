const Menu = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.closedMenuClass = 'menu-closed';
		this.selectedMenuButtonClass = 'selected';
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

		this.select(this.selectors.languageButton).removeClass(this.selectedMenuButtonClass);
		this.select(this.selectors.mainButton).removeClass(this.selectedMenuButtonClass);
	}


	toggleMenuLanguage() {
		this.select(this.selectors.language).toggleClass(this.closedMenuClass);

		if (this.hasClass(this.closedMenuClass)) {
			this.select(this.selectors.languageButton).removeClass(this.selectedMenuButtonClass);
		} else {
			this.select(this.selectors.languageButton).addClass(this.selectedMenuButtonClass);
		}
	}


	toggleMenuMain() {
		this.select(this.selectors.main).toggleClass(this.closedMenuClass);

		if (this.hasClass(this.closedMenuClass)) {
			this.select(this.selectors.mainButton).removeClass(this.selectedMenuButtonClass);
		} else {
			this.select(this.selectors.mainButton).addClass(this.selectedMenuButtonClass);
		}
	}


	toggleMenuMusic() {
		this.select(this.selectors.music).toggleClass(this.closedMenuClass);
	}


	togglePlaylist() {
		this.select(this.selectors.playlist).toggleClass(this.closedMenuClass);
	}
};
