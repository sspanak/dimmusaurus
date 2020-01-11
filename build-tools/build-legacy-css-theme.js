/* eslint no-console: 0, no-undef: 0 */
const readFileSync = require('fs').readFileSync;
const basename = require('path').basename;

if (process.argv.length < 3) {
	const scriptName = basename(process.argv[1]);

	console.info(`${scriptName} - converts css3 rules to more compatible ones for legacy browsers.`);
	console.info(`\nUsage: node ${scriptName} path/to/css/file.css`);
	process.exit(1);
}

const css = readFileSync(process.argv[2], { encoding: 'utf8' });

const cssVars = {};
[...css.matchAll(/[\s{;](--[^:]+):\s*([^;]+)/g)].forEach(match => {
	cssVars[match[1]] = match[2];
});

if (!Object.keys(cssVars).length) {
	console.info('No CSS variables found. Nothing to do.');
	process.exit(0);
}


let legacyCss = css.replace(/:root\s*{[^}]+}\s*/m, '').replace(/var\(\s*([^\s^)]+)\s*\)/g, '$1');
Object.keys(cssVars).forEach(varName => {
	legacyCss = legacyCss.replace(new RegExp(varName, 'g') , cssVars[varName]);
});

console.log(legacyCss);
process.exit(0);
