const PlayerUi = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.playbackRefreshInterval = 0;
		this.onProgressBarClick = () => null;
		this.onAudioLoad = () => null;

		this.classes = {
			disabled: 'disabled',
			disabledBody: 'body-disabled',
			error: 'player-error',
			hidden: 'hidden',
			highlighted: 'highlighted',
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
			playlistItem: '#playlist-list li',
			playlistItemVisible: () => `#playlist-list li:not(.${this.classes.hidden})`,
			playlistList: '#playlist-list',
			playlistSearch: '.playlist-search input[name=search-song]',
			playlistTrackHighlighted: () => `#playlist-list li.${this.classes.highlighted} > .menu-item`,
			playlistTrackPrefix: '#playlist-track-',
			playlistTrackSelected: () => `#playlist-list li:not(.${this.classes.hidden}) .${this.classes.selected}`,
			playlistUnavailableLabel: '#playlist-unavailable-label',
			previous: '#pl-previous',
			progressBar: '.track-progress-bar',
			progressTime: '.player .progress-time',
			searchField: '.playlist-search input',
			timeBalloon: '.player .time-balloon',
			timeBalloonContents: '.player .time-balloon-time',
			totalTime: '.player .total-time',
			trackLoadingIndicator: '.player .loading-indicator .label',
			trackTitle: '.player .track-title',
			tunePlayButton: '.content-tune .tune-play',
			volume: '#pl-volume'
		};

		this.playlistItemDataAttribute = 'playlist-id';
	}


	init() {
		this.show();

		// we need to use addEventListener, because this is the only way of getting mouse coordinates
		if (this.select(this.selectors.progressBar)) {
			this.$element.addEventListener('mouseup', (event) => this.handleProgressBarClick(event));
		}

		if (this.select(this.selectors.progressBar)) {
			this.$element.addEventListener('mousemove', (event) => this.handleProgressBarHover(event));
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


		document.addEventListener('keyup', event => {
			if (!this.isPlaylistOpened() || !('code' in event)) {
				return;
			}

			if (event.code === 'Enter') {
				let trackId = this.getHighlightedTrack();
				if (trackId === -1) {
					console.warn('No highlighted track, so picking the next visible in the playlist.');
					trackId = this.highlightNextTrack().getHighlightedTrack();
				}

				Player.selectTrack(trackId);
				Player.stop();
				Player.playToggle();
			}

			if (event.code === 'ArrowUp') {
				this.highlightPreviousTrack();
			}

			if (event.code === 'ArrowDown') {
				this.highlightNextTrack();
			}
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
		this.select('body').removeClass('no-player');
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
	 * isLoading
	 * Returns whether the UI is in loading state.
	 *
	 * @return {Boolean}
	 */
	isLoading() {
		return this.select(this.selectors.player).hasClass(this.classes.loading);
	}


	/**
	 * togglePlaylist
	 * Self-explanatory
	 *
	 * @param  {void}
	 * @return {void}
	 */
	togglePlaylist() {
		/* eslint-disable no-undef */
		Menu.closeMenuLanguage();
		Menu.closeMenuMain();
		Menu.closeMenuMusic();
		/* eslint-enable no-undef */

		this.clearSearch();
		this.highlightTrack(-1);

		if (this.isPlaylistOpened()) {
			this.closePlaylist();
		} else {
			this.openPlaylist();
		}
	}


	/**
	 * openPlaylist
	 * Self-explanatory
	 *
	 * @param  {void}
	 * @return {void}
	 */
	openPlaylist() {
		this.select('body').addClass(this.classes.disabledBody);
		/* eslint-disable no-undef */
		this.scrollTrackIntoView(Player.currentTrack);

		this.select(this.selectors.playlist).removeClass(Menu.classes.closedMenu);
		/* eslint-enable no-undef */
	}


	/**
	 * closePlaylist
	 * Self-explanatory
	 *
	 * @param  {void}
	 * @return {void}
	 */
	closePlaylist() {
		this.select('body').removeClass(this.classes.disabledBody);
		this.select(this.selectors.playlist).addClass(Menu.classes.closedMenu); // eslint-disable-line no-undef
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
		} else {
			this.select(this.selectors.playlist).removeClass('playlist-unavailable');
		}


		let playlistTemplate = '';
		playlist.forEach((item, index) => {
			playlistTemplate += getPlaylistItemTemplate( // eslint-disable-line no-undef
				index,
				item.title,
				item.duration,
				item.info_url,
				this.selectors.playlistTrackPrefix,
				this.playlistItemDataAttribute
			);
		});

		this.select(this.selectors.playlistList).setHTML(playlistTemplate);

		window.dispatchEvent(new Event('buildPlaylist'));

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


	handleSearch(searchField) {
		if (typeof searchField !== 'object' || searchField.value === undefined) {
			return;
		}

		this.searchForTrack(searchField.value);
	}


	/**
	 * handleProgressBarClick
	 * Detects the click position on the progress bar, calculates the seek percentage from it,
	 * then uses this.seek() to seek the song and update the UI.
	 *
	 * @param {Event} event
	 * @return {void}
	 */
	handleProgressBarClick(event) {
		if (this.isPlayingDisabled() || this.isLoading()) {
			return;
		}
		if (!this.select(this.selectors.progressBar)) {
			return;
		}

		const progressTime = progressBarPositionToSeconds(
			this.$element.getBoundingClientRect(),
			event.clientX,
			this.getTotalTime()
		);

		if (typeof this.onProgressBarClick === 'function') {
			this.onProgressBarClick(progressTime);
		}
	}


	/**
	 * handleProgressBarHover
	 * Detects the hover position over the progress bar and displays a time popup for that
	 * location.
	 *
	 * @param {Event} event
	 * @return {void}
	 */
	handleProgressBarHover(event) {
		if (this.isPlayingDisabled() || this.isLoading()) {
			return;
		}
		if (!this.select(this.selectors.progressBar)) {
			return;
		}

		const timeAtMouse = progressBarPositionToSeconds(
			this.$element.getBoundingClientRect(),
			event.clientX,
			this.getTotalTime()
		);

		this.select(this.selectors.timeBalloon).setStyle({ left: `${event.clientX - 25}px` });
		this.select(this.selectors.timeBalloonContents).setHTML(secondsToTime(timeAtMouse));
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

		this.clearSearch();
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
	 * isPlaylistOpened()
	 * Returns whether the playlist menu is opened or not.
	 *
	 * @return {bool}
	 */
	isPlaylistOpened() {
		return !this.select(this.selectors.playlist).hasClass(Menu.classes.closedMenu); // eslint-disable-line no-undef
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
	 * isSearchEmpty
	 * Returns whether there is some text in the playlist search field or not.
	 *
	 * @return {Boolean}
	 */
	isSearchEmpty() {
		return new UiElement().select(this.selectors.playlistSearch).value === '';
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
	 * scrollTrackIntoView
	 * Scrolls the playlist to the track with the given playlist ID.
	 *
	 * @param {number} playlistId
	 * @return {this}
	 */
	scrollTrackIntoView(playlistId) {
		this.select(`${this.selectors.playlistTrackPrefix}${playlistId}`).scrollIntoView();

		return this;
	}


	/**
	 * getHighlightedTrack
	 * Returns the playlist ID of the currently highlighted track in the playlist.
	 *
	 * @param {void}
	 * @return {number}
	 */
	getHighlightedTrack() {
		let $track = this.select(this.selectors.playlistTrackHighlighted());
		if (!$track.$element && this.isSearchEmpty()) {
			$track = this.select(this.selectors.playlistTrackSelected());
		}

		if (!$track.$element) {
			return -1;
		}

		return Number.parseInt($track.selectParent().getData(this.playlistItemDataAttribute));
	}


	/**
	 * highlightTrack
	 * Changes the background of a track with a given playlist ID, making it "highlighted". Useful for
	 * marking a track ready for action (for example, with the arrows), but without playing it back.
	 * Use any negative number or invalid number to unhighlight all tracks.
	 *
	 * @return {this}
	 */
	highlightTrack(playlistId) {
		const $items = this.selectAll(this.selectors.playlistItem);
		this.removeClassAll($items, this.classes.highlighted);
		if (playlistId >= 0) {
			this
				.select(`${this.selectors.playlistTrackPrefix}${playlistId}`)
				.selectParent()
				.scrollIntoView({ block: 'nearest' })
				.addClass(this.classes.highlighted);
		}

		return this;
	}


	/**
	 * highlightNextTrack
	 * Like this.highlightTrack(), but highlights the next track in the list.
	 *
	 * @return {this}
	 */
	highlightNextTrack() {
		const currentTrackId = `${this.getHighlightedTrack()}`;
		const visibleTracks = this.selectAll(this.selectors.playlistItemVisible());
		if (!visibleTracks.length) {
			console.info('No visible tracks. Not highlighting anything.');
			return this;
		}

		const highlightedIdx = visibleTracks.findIndex(
			t => this.select(t).getData(this.playlistItemDataAttribute) === currentTrackId
		);
		const nextTrack = visibleTracks[highlightedIdx + 1]
			|| visibleTracks[highlightedIdx]
			|| visibleTracks[visibleTracks.length - 1];

		this.highlightTrack(this.select(nextTrack).getData(this.playlistItemDataAttribute));

		return this;
	}


	/**
	 * highlightPreviousTrack
	 * Like this.highlightTrack(), but highlights the previous track in the list.
	 *
	 * @return {this}
	 */
	highlightPreviousTrack() {
		const currentTrackId = `${this.getHighlightedTrack()}`;
		const visibleTracks = this.selectAll(this.selectors.playlistItemVisible());
		if (!visibleTracks.length) {
			console.info('No visible tracks. Not highlighting anything.');
			return this;
		}

		const highlightedIdx = visibleTracks.findIndex(
			t => this.select(t).getData(this.playlistItemDataAttribute) === currentTrackId
		);
		const previousTrack = visibleTracks[highlightedIdx - 1] || visibleTracks[highlightedIdx] || visibleTracks[0];

		this.highlightTrack(this.select(previousTrack).getData(this.playlistItemDataAttribute));

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
		this.removeClassAll($items, this.classes.selected);
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
		this.highlightTrack(-1);

		return this;
	}


	/**
	 * searchForTrack
	 * Filters the playlist by the given track name.
	 *
	 * @param  {string} title
	 * @return {void}
	 */
	searchForTrack(title) {
		const playlist = Player.getPlaylist(); // eslint-disable-line no-undef
		playlist.forEach((track, trackId) => {
			this
				.select(`${this.selectors.playlistTrackPrefix}${trackId}`)
				.selectParent().removeClass(this.classes.hidden);
		});

		if (title === '') {
			return;
		}

		const searchTerm = new RegExp(`${title}`, 'i');
		playlist
			.forEach((track, trackId) => {
				if (track.title && searchTerm.test(`${track.title}`)) {
					return;
				}

				this
					.select(`${this.selectors.playlistTrackPrefix}${trackId}`)
					.selectParent().addClass(this.classes.hidden);
			});
	}


	/**
	 * clearSearch
	 * Clears the search field and restores all playlist items.
	 *
	 * @return {void}
	 */
	clearSearch() {
		if (this.select(this.selectors.searchField)) {
			this.$element.value = '';
		}

		this.searchForTrack('');
	}
};
