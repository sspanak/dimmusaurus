const Theme = new class { // eslint-disable-line no-unused-vars
	constructor () {
		this.themes = ['white-stripes', 'black-sabbath'];

		// This file is included inline in order to apply the theme before rendering anything, so that
		// there would be no flash of unthemed content
		window.addEventListener('DOMContentLoaded', () => this.select(this.getCurrent()));
	}


	getCurrent() {
		return localStorage.getItem('theme') || undefined;
	}


	select(id) {
		const theme = this.themes[id] || '';

		let className = document.querySelector('body').getAttribute('class');
		this.themes.forEach(t => className = className.replace(t, ''));
		className = `${className} ${theme}`.replace(/\s+/, ' ');

		document.querySelector('body').setAttribute('class', className);

		if (theme) {
			localStorage.setItem('theme', id);
		} else {
			localStorage.removeItem('theme');
		}
	}
};
