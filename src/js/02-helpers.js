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
	return `${timeParts[0].toString().padStart(2, '0')}:${timeParts[1].toString().padStart(2, '0')}`;
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
			<a id="${itemId}" onclick="Player.selectTrack(${id});Player.play();">
				<span class="playlist-title">${name}</span>
				<span class="playlist-time">${duration}</span>
			</a>
		</li>`;
}
