/* eslint no-undef: 0 */
const Player = new class { // eslint-disable-line
	constructor() {
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
			this.loadPlaylist();
			PlayerUi.init();
			PlayerUi.onProgressBarClick = (progress) => this.seek(progress);
		} catch (error) {
			console.error(`Player initialization failure. ${error}`);
			this.startupFailure = true;
		}
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
	 * @param  {number} percent
	 * @return {void}
	 */
	seek(percent) {
		if (PlayerUi.isPlayingDisabled()) {
			return;
		}

		let newSeconds = timeToSeconds(PlayerUi.getTotalTime()) / 100 * percent;
		if (Number.isNaN(newSeconds) || newSeconds < 0) {
			newSeconds = 0;
		}

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
	 * @return {void}
	 */
	loadPlaylist() {
		axios.get('/api/music/playlist/')
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
};
