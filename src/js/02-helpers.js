/**
 * addLeadingZeros
 * Forces time format to "mm:ss", prepending leading zeros when necessary.
 * Input could be any: "3:5", "03:5", "3:05", "03:05". In all cases the result would be: "03:05".
 *
 * @param {string} time
 * @return {string}
 */
function addLeadingZeros(time) { // eslint-disable-line no-unused-vars
	if (typeof time !== 'string') {
		return time;
	}

	const timeParts = time.split(':');
	if (timeParts.length !== 2) {
		return time;
	}

	return `${timeParts[0].toString().padStart(2, '0')}:${timeParts[1].toString().padStart(2, '0')}`;
}



/**
 * timeToSeconds
 * Converts a time string of format MM:SS to a number representing the same time in seconds.
 *
 * @param  {string} time
 * @return {number}
 */
function timeToSeconds(time) { // eslint-disable-line no-unused-vars
	if (typeof time !== 'string') {
		return 0;
	}

	const timeParts = time.split(':');
	if (timeParts.length !== 2) {
		return 0;
	}

	return Number.parseInt(timeParts[0]) * 60 + Number.parseInt(timeParts[1]);
}


/**
 * secondsToTime
 * Converts seconds to MM:SS format. Returns "--:--" on non-numeric or negative input.
 *
 * @param  {number} seconds
 * @return {string}
 */
function secondsToTime(seconds) { // eslint-disable-line no-unused-vars
	if (Number.isNaN(seconds) || seconds < 0) {
		return '--:--';
	}

	const sec = Math.round(seconds) % 60;
	const min = Math.floor(Math.round(seconds) / 60);

	return addLeadingZeros(`${min}:${sec}`);
}


/**
 * getPlaylistItemTemplate
 *
 * @param  {number} id
 * @param  {string} name
 * @param  {string} duration
 * @param  {string} htmlIdPrefix
 * @return {string} HTML
 */
function getPlaylistItemTemplate(id, name, duration, htmlIdPrefix) { // eslint-disable-line no-unused-vars
	const itemId = `${htmlIdPrefix.replace('#', '')}${id}`;
	return `<li>
			<a id="${itemId}" class="menu-item" onclick="Player.selectTrack(${id});Player.playToggle();">
				<span class="playlist-title">${name}</span>
				<span class="playlist-time">${duration}</span>
			</a>
		</li>`;
}


/**
 * getAudioSourceTemplate
 *
 * @param  {Array<{ file_type: string, file_name: string }>} sources [description]
 * @return {string} HTML
 */
function getAudioSourceTemplate(sources) { // eslint-disable-line no-unused-vars
	if (!Array.isArray(sources) || !sources.length) {
		return '';
	}

	return sources.map(src => `<source src="${src.file_name}" type="audio/${src.file_type}">`).join();
}
