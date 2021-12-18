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
 * progressBarPositionToSeconds
 * Converts the clicked progress bar position to seconds
 *
 * @param  {TextRectangle} boundingRect
 * @param  {number}        totalSeconds
 * @param  {'MM:SS'}       totalTime
 * @return {number}
 */
function progressBarPositionToSeconds(boundingRect, clickX, totalTime) { // eslint-disable-line no-unused-vars
	if (typeof boundingRect !== 'object' || Number.isNaN(clickX) || clickX < 0) {
		return 0;
	}

	const seekTarget = 1 - (boundingRect.width - (clickX - boundingRect.x)) / boundingRect.width;
	return seekTarget * timeToSeconds(totalTime);
}


/**
 * getPlaylistItemTemplate
 *
 * @param  {number} id
 * @param  {string} name
 * @param  {string} duration
 * @param  {string} url
 * @param  {string} htmlIdPrefix
 * @param  {string} itemIdPrefix
 * @return {string} HTML
 */
// eslint-disable-next-line no-unused-vars
function getPlaylistItemTemplate(id, name, duration, url, trackIdPrefix, itemDataAttribute) {
	const trackId = `${trackIdPrefix.replace('#', '')}${id}`;
	return `<li data-${itemDataAttribute}="${id}">
			<div id="${trackId}" class="menu-item">
				<span class="playlist-title" onclick="Player.selectTrack(${id});Player.playToggle();">${name}</span>
				<span class="playlist-time">${duration}</span>
				<a href="${url}" class="playlist-info fas fa-info-circle" onclick="PlayerUi.closePlaylist()"></a>
			</div>
		</li>`;
}


/**
 * getAudioSourceTemplate
 *
 * @param  {Array<{ file_type: string, file_name: string }>} sources
 * @return {string} HTML
 */
function getAudioSourceTemplate(sources) { // eslint-disable-line no-unused-vars
	if (!Array.isArray(sources) || !sources.length) {
		return '';
	}

	return sources
		.sort((s1, s2) => {
			// codec order should be: opus, ogg, aac (decreasing order of quality)
			if (s1.file_type === s2.file_type) {
				return 0;
			}

			if (s1.file_type < s2.file_type) {
				return 1;
			}

			return -1;
		})
		.map(src => {
			let file_type = '';
			if (src.file_type === 'opus') {
				file_type = 'audio/ogg; codecs="opus"';
			} else if (src.file_type === 'ogg') {
				file_type = 'audio/ogg; codecs="vorbis"';
			} else if (src.file_type === 'aac') {
				file_type = 'audio/mp4';
			}

			return `<source src="${src.file_name}" type='${file_type}'>`;
		})
		.join('');
}
