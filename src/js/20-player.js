/* eslint no-undef: 0 */
const Player = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.playlist = [];
		this.currentTrack = -1;
		this.playbackRefreshInterval = 0;

		this.classes = {
			disabled: 'disabled',
			muted: 'fa-volume-mute',
			pause: 'fa-pause',
			play: 'fa-play',
			selected: 'selected',
			unmuted: 'fa-volume-up'
		};

		this.selectors = {
			audio: '.player audio',
			next: '#pl-next',
			play: '#pl-play',
			player: '.player',
			playhead: '.track-progress-bar .track-progress',
			playlist: '.menu-playlist-wrapper',
			playlistButton: '#pl-playlist-toggle',
			playlistList: '#playlist-list',
			playlistTrackPrefix: '#playlist-track-',
			playlistUnavailableLabel: '#playlist-unavailable-label',
			previous: '#pl-previous',
			progressBar: '.track-progress-bar',
			progressTime: '.player .progress-time',
			totalTime: '.player .total-time',
			trackTitle: '.player .track-title',
			tunePlayButton: '.content-tune .tune-play',
			volume: '.player-controls .volume'
		};

		this._init();
	}

	_init() {
		window.addEventListener('load', () => {
			if (!this._isSupported()) {
				return;
			}

			this._getPlaylist();
			this._show();

			// we need to use addEventListener, because this is the only way of getting mouse coordinates
			if (this.select(this.selectors.progressBar)) {
				this.$element.addEventListener('mouseup', (event) => this.onProgressBarClick(event));
			}

			// toggle playlist both from the button and track title
			this.select(this.selectors.playlistButton).addEventListener('click', (event) => {
				event.stopPropagation();
				this.togglePlaylist();
			});
			// this.select(this.selectors.trackTitle).addEventListener('click', (event) => {
			// 	event.stopPropagation();
			// 	this.togglePlaylist();
			// });
		});
	}


	/**
	 * isSupported
	 * Determines if player will work on this browser.
	 *
	 * @param {void}
	 * @return {Boolean}
	 */
	_isSupported() {
		try {
			const dummyTag = document.createElement('audio');
			const canPlay = dummyTag.canPlayType('audio/ogg; codecs="vorbis"');
			dummyTag.remove();

			return canPlay === 'probably' || canPlay === 'maybe';
		} catch (e) {
			return false;
		}
	}


	/**
	 * show
	 * Show the player and readjust other UI elements for it to fit properly.
	 *
	 * @param void
	 * @return {void}
	 */
	_show() {
		this.select('body').removeClass('unsupported-player');
	}


	/**
	 * toggleMute
	 * Mutes or unmutes player sounds.
	 *
	 * @param {void}
	 * @return {void}
	 */
	toggleMute() {
		this.select(this.selectors.volume);

		if (this.hasClass(this.classes.unmuted)) {
			this.removeClass(this.classes.unmuted);
			this.addClass(this.classes.muted);
			this.addClass(this.classes.disabled);

			if (this.select(this.selectors.audio)) {
				this.$element.muted = true;
			}
		} else {
			this.removeClass(this.classes.muted);
			this.removeClass(this.classes.disabled);
			this.addClass(this.classes.unmuted);

			if (this.select(this.selectors.audio)) {
				this.$element.muted = false;
			}
		}
	}


	/**
	 * playToggle
	 * Plays or pauses the currently selected song.
	 *
	 * @param {void}
	 * @return {void}
	 */
	playToggle() {
		if (!this.select(this.selectors.audio)) {
			return;
		}
		const $audio = this.$element;
		const $play = this.select(this.selectors.play);
		if ($play.hasClass('disabled')) {
			return;
		}


		if (this._isPlaying()) {
			$audio.pause();

			this.select(this.selectors.play).removeClass(this.classes.pause);
			this.select(this.selectors.play).addClass(this.classes.play);
		} else {
			$audio.play().then(() => {
				$play.removeClass(this.classes.disabled);
				$play.removeClass(this.classes.play);
				$play.addClass(this.classes.pause);
				this.onPlayback();
			});

			$play.addClass(this.classes.disabled);
		}
	}


	/**
	 * stop
	 * Stops playing the currently selected song.
	 *
	 * @param {void}
	 * @return {void}
	 */
	stop() {
		if (this.currentTrack === -1) {
			Logger.warn('Trying to stop playback, but no track is selected.');
		}

		if (this._isPlaying()) {
			this.playToggle();
		}

		this.seek(0);
		this._setPlaybackTime('00:00');
	}


	/**
	 * next
	 * Jumps to the next song in the playlist
	 *
	 * @param {void}
	 * @return {void}
	 */
	next() {
		this.select(this.selectors.next);
		if (this.hasClass(this.classes.disabled)) {
			return;
		}

		this.selectTrack(this.currentTrack + 1);
		if (this.currentTrack !== -1) {
			this.playToggle();
		}
	}


	/**
	 * previous
	 * Jumps to the previous song in the playlist
	 *
	 * @param {void}
	 * @return {void}
	 */
	previous() {
		this.select(this.selectors.previous);
		if (this.hasClass(this.classes.disabled)) {
			return;
		}

		this.selectTrack(this.currentTrack - 1);
		if (this.currentTrack !== -1) {
			this.playToggle();
		}
	}


	/**
	 * seek
	 * Seeks to a different time point of the currently playing song.
	 *
	 * @param  {number} percent
	 * @return {void}
	 */
	seek(percent) {
		// if (!this.select(this.selectors.audio)) {
		// 	return;
		// }

		// const $audio = this.$element;

		// const totalTime = this.select(this.selectors.totalTime).getHTML();
		// const targetTime = Math.floor(timeToSeconds(totalTime) / 100 * percent);
		// if (Number.isNaN(targetTime)) {
		// 	Logger.error('Calulated seek time is NaN.');
		// 	return;
		// }
		// $audio.currentTime = targetTime;

		this._movePlayhead(percent);
		// this._setPlaybackTime(percent);
	}


	/**
	 * selectTrack
	 * Finds a given track in the playlist and sets it ready for playing.
	 *
	 * @param  {number} trackId
	 * @return void
	 */
	selectTrack(trackId) {
		if (this.currentTrack === trackId) {
			return;
		}

		if (this.currentTrack !== -1) {
			this.stop();
		}

		const $items = this.selectAll(`[id^='${this.selectors.playlistTrackPrefix.replace('#', '')}']`);
		this.removeClassAll($items, 'selected');
		this.select(this.selectors.trackTitle).setHTML('');
		this._setTotalTime('--:--');
		this._setPlaybackTime('00:00');

		const track = this.playlist[trackId];
		if (!track) {
			this.currentTrack = -1;
			return;
		}

		this.currentTrack = trackId;

		if (!this.select(this.selectors.audio)) {
			Logger.error('Unable to select audio tag and change the track.');
			return;
		}

		const sourcesHTML = getAudioSourceTemplate(this.playlist[this.currentTrack].files);
		this.select(this.selectors.audio).setHTML(sourcesHTML);
		this.$element.load();

		this.select(`${this.selectors.playlistTrackPrefix}${trackId}`).addClass(this.classes.selected);
		this.select(this.selectors.trackTitle).setHTML(track.title);
		this.disableNextWhenLastSong();
		this.disablePreviousWhenFirstSong();
	}


	/**
	 * onProgressBarClick
	 * Detects the click position on the progress bar, calculates the seek percentage from it,
	 * then uses this.seek() to seek the song and update the UI.
	 *
	 *
	 * @param {Event} event
	 * @return {void}
	 */
	onProgressBarClick(event) {
		if (!this.select(this.selectors.progressBar)) {
			return;
		}

		const pbRect = this.$element.getBoundingClientRect();
		const seekTarget = 1 - (pbRect.width - (event.clientX - pbRect.x)) / pbRect.width;

		this.seek(seekTarget * 100);
	}


	/**
	 * onPlayback
	 * Updates the UI with the track progress every second
	 */
	onPlayback() {
		if (!this.select(this.selectors.audio) || !this._isPlaying()) {
			if (this.playbackRefreshInterval) {
				clearInterval(this.playbackRefreshInterval);
				this.playbackRefreshInterval = 0;
			}

			return;
		}

		if (!this.playbackRefreshInterval) {
			this.playbackRefreshInterval = setInterval(() => this.onPlayback(), 1000);
		}

		const currentTime = this._getCurrentTime();
		const totalTime = this._getTotalTime();
		this._setPlaybackTime(currentTime);
		this._setTotalTime(totalTime);

		const progress = timeToSeconds(currentTime) / timeToSeconds(totalTime) * 100;
		this._movePlayhead(progress);
	}


	/**
	 * _movePlayhead
	 * Moves the HTML playhead element to the desired position.
	 *
	 * @param  {number} percentFromStart
	 * @return {void}
	 */
	_movePlayhead(percentFromStart) {
		if (!this.select(this.selectors.playhead)) {
			return;
		}

		let percent = Number.parseFloat(percentFromStart);
		percent = Number.isNaN(percent) ? 0 : percent;

		this.setStyle({ width: `${percent}%` });
	}


	/**
	 * _setPlaybackTime
	 * Updates the HTML element that contains the playback time.
	 *
	 * @param {string} percentFromStart
	 * @return {void}
	 */
	_setPlaybackTime(time) {
		this.select(this.selectors.progressTime).setHTML(time);
	}


	/**
	 * _setTotalTime
	 * Updates the HTML element that contains the total time.
	 *
	 * @param {string} percentFromStart
	 * @return {void}
	 */
	_setTotalTime(time) {
		this.select(this.selectors.totalTime).setHTML(time);
	}


	disableNextWhenLastSong() {
		this.select(this.selectors.next);

		if (this.currentTrack === this.playlist.length - 1) {
			this.addClass(this.classes.disabled);
		} else {
			this.removeClass(this.classes.disabled);
		}
	}


	disablePreviousWhenFirstSong() {
		this.select(this.selectors.previous);

		if (this.currentTrack === 0) {
			this.addClass(this.classes.disabled);
		} else {
			this.removeClass(this.classes.disabled);
		}
	}


	/**
	 * togglePlaylist
	 * Self-explanatory
	 *
	 * @param  {void}
	 * @return {void}
	 */
	togglePlaylist() {
		this.select(this.selectors.playlist).toggleClass(Menu.closedMenuClass); // eslint-disable-line no-undef
	}


	/**
	 * _getPlaylist
	 * Fetches the playlist from the backend and displays if there were no errors.
	 * In case there were, it will enable the "Playlist unavailable" message.
	 *
	 * @return {void}
	 */
	_getPlaylist() {
		axios.get('/api/music/playlist/')
			.then(data => {
				this.playlist = [];
				let track = -1;
				if (data && data.data && data.data.playlist && Array.isArray(data.data.playlist)) {
					this.playlist = data.data.playlist.reverse();
					this._displayPlaylist(this.playlist);
					track = 0;
				}
				this.selectTrack(track);
			})
			.catch(error => {
				Logger.error(`Failed fetching the playlist. ${error}.`);
				this._displayPlaylist([]);
			});
	}


	/**
	 * _displayPlaylist
	 * Builds the playlist HTML and injects it into the page.
	 *
	 * @param  {{ id: number, title: string, duration: string, files: {file_type, file_name}[] }[]} playlist
	 * @return {void}
	 */
	_displayPlaylist(playlist) {
		if (!playlist || !playlist.length) {
			Logger.warn('Displaying empty playlist.');

			this.select(this.selectors.playlist).addClass('playlist-unavailable');
		}

		this.select(this.selectors.playlist).removeClass('playlist-unavailable');

		let playlistTemplate = '';
		playlist.forEach((item, index) => {
			playlistTemplate += getPlaylistItemTemplate(
				index,
				item.title,
				item.duration,
				this.selectors.playlistTrackPrefix
			);
		});

		this.select(this.selectors.playlistList).setHTML(playlistTemplate);
	}


	/**
	 * _isPlaying
	 * Returns the currently playing status of the UI.
	 *
	 * @return {Boolean}
	 */
	_isPlaying() {
		return this.select(this.selectors.play).hasClass(this.classes.pause);
	}


	/**
	 * _getTotalTime
	 * Returns the duration of the currently loaded audio file.
	 *
	 * @return {string} 'MM:SS'
	 */
	_getTotalTime() {
		const $audio = this.select(this.selectors.audio).$element;
		const sec = $audio !== null ? $audio.duration : null;
		return secondsToTime(sec);
	}


	/**
	 * _getCurrentTime
	 * Returns the current playback position in an audio.
	 *
	 * @return {string} 'MM:SS'
	 */
	_getCurrentTime() {
		const $audio = this.select(this.selectors.audio).$element;
		const sec = $audio !== null ? $audio.currentTime : null;
		return secondsToTime(sec);
	}
};
