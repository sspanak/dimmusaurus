/* eslint no-console: 0, no-undef: 0 */
const { minify } = require('csso');
const { readFileSync } = require('fs');
const { basename } = require('path');

if (process.argv.length !== 2) {
	const scriptName = basename(process.argv[1]);

	console.info(`${scriptName} - minifies CSS using CSSO.`);
	console.info(`\nUsage: cat some/file.css | node ${scriptName}`);
	process.exit(1);
}

const { css } = minify(
	readFileSync(process.stdin.fd, { encoding: 'utf8' }),
	{ forceMediaMerge: false, restructure: true }
);

console.log(css);
process.exit(0);
