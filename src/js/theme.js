const Theme = new class { // eslint-disable-line no-unused-vars
	constructor () {
		this.themes = [
			{
				kind: 'light',
				name: 'white-stripes'
			},
			{
				kind: 'dark',
				name: 'black-sabbath'
			}
		];

		// This file is included inline in order to apply the theme before rendering anything, so that
		// there would be no flash of unthemed content
		window.addEventListener('DOMContentLoaded', () => this.select(this.getCurrent()));
	}


	getCurrent() {
		return localStorage.getItem('theme') || undefined;
	}


	select(id) {
		const { name, kind } = this.themes[id] || { kind: '' , name: '' };

		this
			._apply(name)
			._setMeta(kind)
			._save(name, id);
	}


	_apply(themeName) {
		let className = document.querySelector('body').getAttribute('class');
		this.themes.forEach(t => className = className.replace(t.name, ''));
		className = `${className} ${themeName}`.replace(/\s+/, ' ');

		document.querySelector('body').setAttribute('class', className);

		return this;
	}


	_setMeta(themeKind) {
		const $metaColorScheme = document.head.querySelector('meta[name=color-scheme]');
		if (themeKind) {
			$metaColorScheme.setAttribute('content', themeKind);
		} else {
			$metaColorScheme.setAttribute('content', 'light dark');
		}

		return this;
	}


	_save(themeName, id) {
		if (themeName) {
			localStorage.setItem('theme', id);
		} else {
			localStorage.removeItem('theme');
		}

		return this;
	}
};
