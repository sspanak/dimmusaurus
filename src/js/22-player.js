/* eslint no-undef: 0 */
const Player = new class { // eslint-disable-line
	constructor() {
		this.cookies = {
			lastTrack: 'track',
			lastTrackTime: 'track_time'
		};

		this.currentTrack = -1;
		this.playlist = [];
		this.startupFailure = false;

		window.addEventListener('load', () => this._init());
	}

	_init() {
		if (!this.isSupported()) {
			return;
		}
		if (typeof axios === 'undefined') {
			console.error('Failed initializing player. Axios is not available.');
			return;
		}

		try {
			this.loadPlaylist().then(() => this.restoreLastPlayedTrack());

			PlayerUi.init();
			PlayerUi.onProgressBarClick = (time) => this.seek(time);
		} catch (error) {
			console.error(`Player initialization failure. ${error}`);
			this.startupFailure = true;
		}

		window.addEventListener('beforeunload', () => this.saveTrackForNextTime());
	}


	/**
	 * isSupported
	 * Determines if player will work on this browser.
	 *
	 * @param {void}
	 * @return {Boolean}
	 */
	isSupported() {
		return !this.startupFailure
			&& (
				this.isAudioTypeSupported('audio/ogg') ||
				this.isAudioTypeSupported('audio/mp4')
			);
	}


	/**
	 * isAudioTypeSupported
	 * Checks if given mime type is supported, for example: 'audio/ogg'.
	 * Input could include a codec, for example 'audio/ogg; codecs="vorbis"'
	 *
	 * @param  {[type]}  sourceType [description]
	 * @return {Boolean}            [description]
	 */
	isAudioTypeSupported(sourceType) {
		try {
			const dummyTag = document.createElement('audio');
			const canPlay = dummyTag.canPlayType(sourceType);
			dummyTag.remove();

			return canPlay === 'probably' || canPlay === 'maybe';
		} catch (e) {
			return false;
		}
	}


	/**
	 * saveTrackForNextTime
	 * Saves the current playing track and progress. Later, they can be restored
	 * with this.restoreLastPlayedTrack().
	 */
	saveTrackForNextTime() {
		if (PlayerUi.hasFailed()) {
			return;
		}

		setCookie(this.cookies.lastTrack, `${this.currentTrack}`); // eslint-disable-line no-undef
		setCookie(
			this.cookies.lastTrackTime,
			`${timeToSeconds(PlayerUi.getCurrentTime())}` // eslint-disable-line no-undef
		);
	}


	/**
	 * restoreLastPlayedTrack
	 * Once the page loads, restores the last played track and time. This is useful when changing
	 * the language, or when coming back to the site several days later.
	 */
	restoreLastPlayedTrack() {
		const trackId = Number.parseInt(getCookie(this.cookies.lastTrack)); // eslint-disable-line no-undef
		if (Number.isNaN(trackId) || !this.playlist[trackId]) {
			return;
		}

		this.selectTrack(trackId);

		const trackTime = Number.parseInt(getCookie(this.cookies.lastTrackTime)); // eslint-disable-line no-undef
		if (Number.isNaN(trackTime) || trackTime <= 0) {
			return;
		}


		PlayerUi.onAudioLoad = () => {
			this.seek(trackTime);
			// Progress must be restored only on initial page load. However, onAudioLoad() is called
			// on every track change. To preven resetting the time incorrectly, we must unset the handler.
			PlayerUi.onAudioLoad = () => null;
		};
	}


	/**
	 * toggleMute
	 * Mutes or unmutes player sounds.
	 *
	 * @param {void}
	 * @return {void}
	 */
	toggleMute() {
		PlayerUi.toggleMute();
		PlayerUi.getAudio().muted = PlayerUi.isMuted();
	}


	/**
	 * playToggle
	 * Plays or pauses the currently selected song.
	 *
	 * @param {void}
	 * @return {void}
	 */
	playToggle() {
		const $audio = PlayerUi.getAudio();
		if (!Object.keys($audio) || PlayerUi.isPlayingDisabled()) {
			return;
		}

		// pause
		if (PlayerUi.isPlaying()) {
			PlayerUi.pause();
			$audio.pause();
			return;
		}

		// play
		PlayerUi.disablePlay(); // disable while loading
		const playbackPromise = $audio.play();

		// for browsers that won't return a promise we just assume it was successful.
		if (playbackPromise === undefined) {
			PlayerUi.enablePlay().play();
			return;
		}

		// otherwise, await until playback begins and enable the UI
		playbackPromise.then(() => {
			PlayerUi.enablePlay().play();
		}).catch(error => {
			if (error.code === error.ABORT_ERR) {
				// A user aborting the audio loading is not an error, so we skip it.
				console.warn('Audio loading aborted');
				return;
			}

			PlayerUi.fail(error);
		});
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
			console.warn('Trying to stop playback, but no track is selected.');
		}

		if (PlayerUi.isPlaying()) {
			this.playToggle();
		}

		this.seek(0);
	}


	/**
	 * next
	 * Jumps to the next song in the playlist
	 *
	 * @param {void}
	 * @return {void}
	 */
	next() {
		if (PlayerUi.isNextDisabled()) {
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
		if (PlayerUi.isPreviousDisabled()) {
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
	 * @param  {number} time 	[seconds since the beginning]
	 * @return {void}
	 */
	seek(time) {
		if (PlayerUi.isPlayingDisabled()) {
			return;
		}

		const newSeconds = (Number.isNaN(time) || time < 0) ? 0 :  time;

		PlayerUi.getAudio().currentTime = newSeconds;
		PlayerUi.updateProgress();
	}


	/**
	 * selectTrack
	 * Finds a given track in the playlist and sets it ready for playing.
	 *
	 * @param  {number} playlistId
	 * @return void
	 */
	selectTrack(playlistId) {
		if (this.currentTrack === playlistId) {
			return;
		}

		if (!PlayerUi.getAudio()) {
			console.error('Can not select a track. <audio> element unavailable.');
			return;
		}

		// stop the previous track before attempting anything else
		if (this.currentTrack !== -1) {
			this.stop();
		}

		PlayerUi.resetTrackSelection();

		const track = this.playlist[playlistId];
		if (!track) {
			this.currentTrack = -1;
			PlayerUi.fail(new ReferenceError(`No track with id: ${playlistId}.`));
			return;
		}

		this.currentTrack = playlistId;

		PlayerUi
			.enableControls()
			.hideError()
			.setAudioSources(this.playlist[this.currentTrack].files)
			.onAudioSourceError(error => PlayerUi.fail(error))
			.selectTrack(playlistId, track.title, this.playlist.length);
	}


	/**
	 * selectTrack
	 * Searches the playlist for a track with the given ID, then attempts to select it.
	 *
	 * @param  {number} trackId
	 * @return void
	 */
	selectTrackById(trackId) {
		this.selectTrack(this.playlist.findIndex(track => track.id === trackId));
	}


	/**
	 * loadPlaylist
	 * Fetches the playlist from the backend and displays if there were no errors.
	 * In case there were, it will enable the "Playlist unavailable" message.
	 *
	 * @return {Promise<void>}
	 */
	loadPlaylist() {
		const languageCode = document.querySelector('html').getAttribute('lang');

		return axios.get(`/api/music/playlist/${languageCode}/`)
			.then(data => {
				this.playlist = [];
				let track = -1;
				if (data && data.data && data.data.playlist && Array.isArray(data.data.playlist)) {
					this.playlist = data.data.playlist;
					PlayerUi.buildPlaylist(this.playlist);
					track = 0;
				}
				this.selectTrack(track);
			})
			.catch(error => {
				console.error(`Failed fetching the playlist. ${error}.`);
				PlayerUi.buildPlaylist([]);
			});
	}


	/**
	 * getPlaylist
	 *
	 * @return {{ id: number, title: string, duration: string, files: {file_type, file_name}[] }[]}
	 */
	getPlaylist() {
		return this.playlist;
	}
};
