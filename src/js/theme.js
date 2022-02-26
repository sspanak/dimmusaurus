// This file is included inline in order to apply the theme before rendering anything, so that
// there would be no flash of unthemed content

const THEMES = ['white-stripes', 'black-sabbath'];


function getCurrentTheme() { // eslint-disable-line no-unused-vars
	return localStorage.getItem('theme') || 0;
}


function selectTheme(id) { // eslint-disable-line no-unused-vars
	const theme = THEMES[id] ? id : 0;
	localStorage.setItem('theme', theme);

	document.querySelector('body').setAttribute('class', THEMES[theme]);
}


function clearThemePreference() { // eslint-disable-line no-unused-vars
	localStorage.removeItem('theme');
}
