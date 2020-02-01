/* eslint no-undef: 0 */
const Player = new class { // eslint-disable-line
	constructor() {
		this.playlist = [];
		this.currentTrack = -1;

		this._init();
	}

	_init() {
		window.addEventListener('load', () => {
			if (!this._isSupported()) {
				return;
			}

			this.loadPlaylist();
			PlayerUi.init();
			PlayerUi.onProgressBarClick = (progress) => this.seek(progress);
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

		if (PlayerUi.isPlaying()) {
			PlayerUi.pause();
			$audio.pause();
		} else {
			$audio.play().then(() => {
				PlayerUi.enablePlay().play();
			});

			PlayerUi.disablePlay();
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

		if (PlayerUi.isPlaying()) {
			this.playToggle();
		}

		this.seek(0);
		PlayerUi.setPlaybackTime('00:00');
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
		const newSeconds = timeToSeconds(PlayerUi.getTotalTime()) / 100 * percent;

		PlayerUi.getAudio().currentTime = newSeconds;
		PlayerUi.updateProgress();
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

		if (!PlayerUi.getAudio()) {
			Logger.error('Can not select a track. <audio> element unavailable.');
			return;
		}

		// stop the previous track before attempting anything else
		if (this.currentTrack !== -1) {
			this.stop();
		}

		PlayerUi.resetTrackSelection();

		const track = this.playlist[trackId];
		if (!track) {
			this.currentTrack = -1;
			return;
		}

		this.currentTrack = trackId;

		PlayerUi.setAudioSources(this.playlist[this.currentTrack].files);
		PlayerUi.selectTrack(trackId, track.title, this.playlist.length);
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
					this.playlist = data.data.playlist.reverse();
					PlayerUi.buildPlaylist(this.playlist);
					track = 0;
				}
				this.selectTrack(track);
			})
			.catch(error => {
				Logger.error(`Failed fetching the playlist. ${error}.`);
				PlayerUi.buildPlaylist([]);
			});
	}
};
