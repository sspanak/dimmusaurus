const PlayerUi = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.playbackRefreshInterval = 0;
		this.onProgressBarClick = () => null;
		this.onAudioLoad = () => null;

		this.classes = {
			disabled: 'disabled',
			error: 'player-error',
			loading: 'player-loading',
			muted: 'fa-volume-mute',
			pause: 'fa-pause',
			play: 'fa-play',
			selected: 'selected',
			unmuted: 'fa-volume-up'
		};

		this.selectors = {
			audio: '.player audio',
			audioSource: '.player audio source',
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
			trackLoadingIndicator: '.player .loading-indicator .label',
			trackTitle: '.player .track-title',
			tunePlayButton: '.content-tune .tune-play',
			volume: '#pl-volume'
		};
	}


	init() {
		this.show();

		// we need to use addEventListener, because this is the only way of getting mouse coordinates
		if (this.select(this.selectors.progressBar)) {
			this.$element.addEventListener('mouseup', (event) => this.handleProgressBarClick(event));
		}

		// toggle playlist both from the button and track title
		this.select(this.selectors.playlistButton).addEventListener('click', (event) => {
			event.stopPropagation();
			this.togglePlaylist();
		});
		this.select(this.selectors.trackTitle).addEventListener('click', (event) => {
			event.stopPropagation();
			this.togglePlaylist();
		});

		this.select(this.selectors.audio).addEventListener('error', (error) => {
			this.fail(error);
		});

		this.select(this.selectors.audio).addEventListener('loadstart', () => this.showLoading());
		this.select(this.selectors.audio).addEventListener('loadeddata', () => {
			this.hideLoading();
			this.onAudioLoad();
		});
	}


	/**
	 * show
	 * Show the player and readjust other UI elements for it to fit properly.
	 *
	 * @param void
	 * @return {void}
	 */
	show() {
		this.select('body').removeClass('unsupported-player');
	}


	/**
	 * fail
	 * Switches to error state, displaying the most common error that a track failed to load.
	 *
	 * @param {Error} error
	 * @return {this}
	 */
	fail(error) {
		this.disableControls();
		this.showError(MESSAGES.errorLoadingTrack); // eslint-disable-line no-undef

		console.error(`Player failure requested. ${error.message}`);

		return this;
	}


	/**
	 * showError
	 * self-explanatory
	 *
	 * @param {string}
	 * @return {this}
	 */
	showError(errorMessage) {
		this.setPlaybackTime('--:--');
		this.select(this.selectors.player).removeClass(this.classes.loading);
		this.select(this.selectors.player).addClass(this.classes.error);
		this.select(this.selectors.trackTitle).setHTML(errorMessage);

		this.hideLoading();

		return this;
	}

	/**
	 * hideError
	 * self-explanatory
	 *
	 * @return {this}
	 */
	hideError() {
		this.select(this.selectors.player).removeClass(this.classes.error);
		this.select(this.selectors.trackTitle).setHTML('');

		return this;
	}


	/**
	 * hasFailed
	 * Returns whether the UI is in error state.
	 *
	 * @return {Boolean}
	 */
	hasFailed() {
		return this.select(this.selectors.player).hasClass(this.classes.error);
	}


	/**
	 * showLoading
	 * Enables loading label and changes progress bar style to "loading".
	 *
	 * @return {void}
	 */
	showLoading() {
		this.select(this.selectors.trackLoadingIndicator).setHTML(MESSAGES.loading); // eslint-disable-line no-undef
		this.select(this.selectors.player).addClass(this.classes.loading);
	}


	/**
	 * hideLoading
	 * Turns off loading label on changes progress bar to normal
	 *
	 * @return {void}
	 */
	hideLoading() {
		this.select(this.selectors.player).removeClass(this.classes.loading);
		this.select(this.selectors.trackLoadingIndicator).setHTML('');
	}


	/**
	 * togglePlaylist
	 * Self-explanatory
	 *
	 * @param  {void}
	 * @return {void}
	 */
	togglePlaylist() {
		Menu.closeMenuLanguage(); // eslint-disable-line no-undef
		Menu.closeMenuMain(); // eslint-disable-line no-undef
		Menu.closeMenuMusic(); // eslint-disable-line no-undef
		this.select(this.selectors.playlist).toggleClass(Menu.closedMenuClass); // eslint-disable-line no-undef
	}


	/**
	 * closePlaylist
	 * Self-explanatory
	 *
	 * @param  {void}
	 * @return {void}
	 */
	closePlaylist() {
		this.select(this.selectors.playlist).addClass(Menu.closedMenuClass); // eslint-disable-line no-undef
	}


	/**
	 * buildPlaylist
	 * Builds the playlist HTML and injects it into the page.
	 *
	 * @param  {{ id: number, title: string, duration: string, files: {file_type, file_name}[] }[]} playlist
	 * @return {this}
	 */
	buildPlaylist(playlist) {
		if (!playlist || !playlist.length) {
			console.warn('Displaying empty playlist.');

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

		return this;
	}


	disableNextWhenLastSong(currentTrack, playlistLength) {
		this.select(this.selectors.next);

		if (currentTrack === playlistLength - 1) {
			this.addClass(this.classes.disabled);
		} else {
			this.removeClass(this.classes.disabled);
		}

		return this;
	}


	disablePreviousWhenFirstSong(currentTrack) {
		this.select(this.selectors.previous);

		if (currentTrack === 0) {
			this.addClass(this.classes.disabled);
		} else {
			this.removeClass(this.classes.disabled);
		}

		return this;
	}

	disablePlay() {
		this.select(this.selectors.play).addClass(this.classes.disabled);

		return this;
	}


	enablePlay() {
		this.select(this.selectors.play).removeClass(this.classes.disabled);

		return this;
	}


	disableControls() {
		this.disablePlay();

		[
			this.selectors.volume,
			this.selectors.progressBar,
			this.selectors.progressTime,
			this.selectors.totalTime
		].forEach(selector => this.select(selector).addClass(this.classes.disabled));

		return this;
	}


	enableControls() {
		this.enablePlay();

		[
			this.selectors.volume,
			this.selectors.progressBar,
			this.selectors.progressTime,
			this.selectors.totalTime
		].forEach(selector => this.select(selector).removeClass(this.classes.disabled));

		return this;
	}



	/**
	 * handleProgressBarClick
	 * Detects the click position on the progress bar, calculates the seek percentage from it,
	 * then uses this.seek() to seek the song and update the UI.
	 *
	 *
	 * @param {Event} event
	 * @return {void}
	 */
	handleProgressBarClick(event) {
		if (this.isPlayingDisabled()) {
			return;
		}
		if (!this.select(this.selectors.progressBar)) {
			return;
		}

		const pbRect = this.$element.getBoundingClientRect();
		const seekTarget = 1 - (pbRect.width - (event.clientX - pbRect.x)) / pbRect.width;

		if (typeof this.onProgressBarClick === 'function') {
			this.onProgressBarClick(seekTarget * 100);
		}
	}


	/**
	 * onPlayback
	 * Updates the UI with the track progress every second.
	 */
	onPlayback() {
		if (!this.select(this.selectors.audio) || !this.isPlaying()) {
			if (this.playbackRefreshInterval) {
				clearInterval(this.playbackRefreshInterval);
				this.playbackRefreshInterval = 0;
			}

			return;
		}

		if (!this.playbackRefreshInterval) {
			this.playbackRefreshInterval = setInterval(() => this.onPlayback(), 1000);
		}

		this.updateProgress();
	}


	/**
	 * toggleMute
	 * Toggles mute button.
	 *
	 * @param {void}
	 * @return {this}
	 */
	toggleMute() {
		this.select(this.selectors.volume);

		if (this.hasClass(this.classes.disabled)) {
			return this;
		}

		if (this.hasClass(this.classes.unmuted)) {
			this.removeClass(this.classes.unmuted);
			this.addClass(this.classes.muted);
		} else {
			this.removeClass(this.classes.muted);
			this.addClass(this.classes.unmuted);
		}

		return this;
	}


	/**
	 * play
	 *
	 * @param {void}
	 * @return {this}
	 */
	play() {
		if (this.isPlayingDisabled()) {
			return this;
		}

		this.select(this.selectors.play);
		this.removeClass(this.classes.play);
		this.addClass(this.classes.pause);

		this.onPlayback();

		return this;
	}


	/**
	 * pause
	 *
	 * @param {void}
	 * @return {this}
	 */
	pause() {
		if (this.isPlayingDisabled()) {
			return this;
		}

		this.select(this.selectors.play);
		this.removeClass(this.classes.pause);
		this.addClass(this.classes.play);

		return this;
	}


	/**
	 * updateProgress
	 * Reads current and total time from the <audio> element and updates all UI elements accordingly.
	 *
	 * @return {this}
	 */
	updateProgress() {
		const currentTime = this.getCurrentTime();
		const totalTime = this.getTotalTime();
		this.setPlaybackTime(currentTime);
		this.setTotalTime(totalTime);

		const progress = timeToSeconds(currentTime) / timeToSeconds(totalTime) * 100;
		this.movePlayhead(progress);

		return this;
	}


	/**
	 * movePlayhead
	 * Moves the HTML playhead element to the desired position.
	 *
	 * @param  {number} percentFromStart
	 * @return {this}
	 */
	movePlayhead(percentFromStart) {
		if (!this.select(this.selectors.playhead)) {
			return this;
		}

		let percent = Number.parseFloat(percentFromStart);
		percent = Number.isNaN(percent) ? 0 : percent;

		this.setStyle({ width: `${percent}%` });

		return this;
	}


	/**
	 * setPlaybackTime
	 * Updates the HTML element that contains the playback time.
	 *
	 * @param {string} percentFromStart
	 * @return {this}
	 */
	setPlaybackTime(time) {
		this.select(this.selectors.progressTime).setHTML(time);

		return this;
	}


	/**
	 * setTotalTime
	 * Updates the HTML element that contains the total time.
	 *
	 * @param {string} percentFromStart
	 * @return {this}
	 */
	setTotalTime(time) {
		this.select(this.selectors.totalTime).setHTML(time);

		return this;
	}


	/**
	 * getTotalTime
	 * Returns the duration of the currently loaded audio file.
	 *
	 * @return {string} 'MM:SS'
	 */
	getTotalTime() {
		const $audio = this.select(this.selectors.audio).$element;
		const sec = $audio !== null ? $audio.duration : null;
		return secondsToTime(sec);
	}


	/**
	 * getCurrentTime
	 * Returns the current playback position in an audio.
	 *
	 * @return {string} 'MM:SS'
	 */
	getCurrentTime() {
		const $audio = this.select(this.selectors.audio).$element;
		const sec = $audio !== null ? $audio.currentTime : null;
		return secondsToTime(sec);
	}


	/**
	 * getProgress
	 * Returns track progress amount in percent.
	 *
	 * @return {number}
	 */
	getProgress() {
		const progress = timeToSeconds(this.getCurrentTime()) / timeToSeconds(this.getTotalTime()) * 100;
		return Number.isNaN(progress) || progress < 0 ? 0 : progress;
	}


	/**
	 * isPlaying
	 * Returns the currently playing status of the UI.
	 *
	 * @return {Boolean}
	 */
	isPlaying() {
		return this.select(this.selectors.play).hasClass(this.classes.pause);
	}


	/**
	 * isPlayingDisabled
	 * Returns whether the play button is disabled or not.
	 *
	 * @return {Boolean}
	 */
	isPlayingDisabled() {
		return this.select(this.selectors.play).hasClass(this.classes.disabled);
	}


	/**
	 * isPlaying
	 * Returns the currently playing status of the UI.
	 *
	 * @return {Boolean}
	 */
	isMuted() {
		return this.select(this.selectors.volume).hasClass(this.classes.muted);
	}


	/**
	 * isNextDisabled
	 * Returns whether the next button is disabled or not.
	 *
	 * @return {Boolean}
	 */
	isNextDisabled() {
		return this.select(this.selectors.next).hasClass(this.classes.disabled);
	}


	/**
	 * isPreviousDisabled
	 * Returns whether the previous button is disabled or not.
	 *
	 * @return {Boolean}
	 */
	isPreviousDisabled() {
		return this.select(this.selectors.previous).hasClass(this.classes.disabled);
	}


	/**
	 * getAudio
	 * Returns the HTML Audio element or an empty object if it is unavailable.
	 *
	 * @return {HTMLElement|{}}
	 */
	getAudio() {
		const $audio = this.select(this.selectors.audio).$element;
		if (!$audio) {
			console.warn('Could not get <audio> element. Returning an empty object.');
			return {};
		}

		return $audio;
	}


	/**
	 * setAudioSources
	 * Sets the source URLs of the <audio> element. Input is the same as for getAudioSourceTemplate().
	 * On invalid input sources will be simply erased.
	 *
	 * @param {Array<PlaylistSourceFile]} playlistFiles
	 * @return {this}
	 */
	setAudioSources(playlistFiles) {
		const sourcesHTML = getAudioSourceTemplate(playlistFiles);
		this.select(this.selectors.audio).setHTML(sourcesHTML);
		this.$element.load();

		return this;
	}


	/**
	 * onAudioSourceError
	 * Sets an error handler for <source> elements inside <audio>.
	 * IMPORTANT: this.setAudioSources() should have been called first, to initialize the <source> elements.
	 *
	 * @param {Function} callback
	 * @return {this}
	 */
	onAudioSourceError(callback) {
		if (typeof callback !== 'function') {
			return this;
		}

		const aSources = this.selectAll(this.selectors.audioSource);

		let triesLeft = aSources.length - 1;

		aSources.forEach($source => {
			$source.addEventListener('error', () => {
				if (triesLeft === 0) {
					callback(new Error('All audio sources have failed loading.'));
				} else {
					triesLeft--;
				}
			});
		});

		return this;
	}


	/**
	 * resetTrackSelection
	 * Clears track selection from the player and the playlist.
	 *
	 * @return {this}
	 */
	resetTrackSelection() {
		const $items = this.selectAll(`[id^='${this.selectors.playlistTrackPrefix.replace('#', '')}']`);
		this.removeClassAll($items, 'selected');
		this.select(this.selectors.trackTitle).setHTML('');
		this.setTotalTime('--:--');
		this.setPlaybackTime('--:--');

		return this;
	}


	/**
	 * selectTrack
	 * Marks a track as selected in the playlist and puts it in the player.
	 *
	 * @param  {number} playlistId
	 * @param  {string} trackTitle
	 * @param  {number} playlistLength
 	 * @return {this}
	 */
	selectTrack(playlistId, trackTitle, playlistLength) {
		this.select(`${this.selectors.playlistTrackPrefix}${playlistId}`).addClass(this.classes.selected);
		this.select(this.selectors.trackTitle).setHTML(trackTitle);
		this.disableNextWhenLastSong(playlistId, playlistLength);
		this.disablePreviousWhenFirstSong(playlistId);
		this.setPlaybackTime('00:00');

		return this;
	}
};
