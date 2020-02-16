/* eslint no-console: 0, no-undef: 0 */
const readFileSync = require('fs').readFileSync;
const basename = require('path').basename;


function replaceVariables(css) {
	const cssVars = {};
	[...css.matchAll(/[\s{;](--[^:]+):\s*([^;]+)/g)].forEach(match => {
		cssVars[match[1]] = match[2];
	});

	if (!Object.keys(cssVars).length) {
		return css;
	}


	let legacyCss = css.replace(/:root\s*{[^}]+}\s*/m, '').replace(/var\(\s*([^\s^)]+)\s*\)/g, '$1');
	Object.keys(cssVars).forEach(varName => {
		legacyCss = legacyCss.replace(new RegExp(varName, 'g') , cssVars[varName]);
	});

	return legacyCss;
}


function replaceRules(css) {
	const rulesMap = {
		'align-items:([^;]+);': [
			'-webkit-align-items:$1;',
			'align-items:$1;'
		],
		'display:\\s*flex;': [
			'display:-moz-box;',
			'display:-ms-flexbox;',
			'display:-webkit-box;',
			'display:-webkit-flex;',
			'display:flex;'
		],
		'display:\\s*inline-flex;': [
			'display:-moz-inline-box;',
			'display:-ms-inline-flexbox;',
			'display:-webkit-inline-box;',
			'display:-webkit-inline-flex;',
			'display:inline-flex;'
		],
		'flex-flow:([^;]+);': [
			'-webkit-flex-flow:$1;',
			'flex-flow:$1;'
		],
		'flex:\\s*auto;': [
			'-ms-flex:auto;',
			'-webkit-flex:auto;',
			'flex:auto;'
		],
		'justify-content:([^;]+);': [
			'-webkit-justify-content:$1;',
			'justify-content:$1;'
		],
		// 'order', not to be confused with 'border'
		'order:\\s*(\\d)\\s*;': [
			'-webkit-order:$1;',
			'order:$1;'
		],
		'transition:([^;]+);': [
			'-webkit-transition:$1;', // even IE9 supports it, but not webkit...
			'transition:$1'
		]
	};


	let legacyCss = css;
	Object.keys(rulesMap).forEach(rule => {
		legacyCss = legacyCss.replace(new RegExp(rule, 'g'), rulesMap[rule].join(''));
	});

	return legacyCss;
}



if (process.argv.length < 3) {
	const scriptName = basename(process.argv[1]);

	console.info(`${scriptName} - converts css3 rules to more compatible ones for legacy browsers.`);
	console.info(`\nUsage: node ${scriptName} path/to/css/file.css`);
	process.exit(1);
}

const css = readFileSync(process.argv[2], { encoding: 'utf8' });
const legacyCss = replaceRules(replaceVariables(css));

console.log(legacyCss);
process.exit(0);


