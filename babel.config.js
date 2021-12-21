'use strict';
module.exports = function(api) {
	api.cache(false);

	const presets = [[
		'@babel/preset-env', {
			'targets': {
				'android': '4.4',
				'edge': '12',
				'ios': '7',
				'safari': '7'
			}
		}
	]];
	return {
		plugins: [],
		presets
	};
};
