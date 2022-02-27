// This file is included inline in order to apply the theme before rendering anything, so that
// there would be no flash of unthemed content

const THEMES = ['white-stripes', 'black-sabbath'];


function getCurrentTheme() { // eslint-disable-line no-unused-vars
	return localStorage.getItem('theme') || undefined;
}


function selectTheme(id) { // eslint-disable-line no-unused-vars
	const theme = THEMES[id] || '';

	let className = document.querySelector('body').getAttribute('class');
	THEMES.forEach(t => className = className.replace(t, ''));
	className = `${className} ${theme}`.replace(/\s+/, ' ');

	document.querySelector('body').setAttribute('class', className);

	if (theme) {
		localStorage.setItem('theme', id);
	} else {
		localStorage.removeItem('theme');
	}
}
