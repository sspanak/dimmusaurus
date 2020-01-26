const Player = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.playlist = [];

		this.classes = {
			muted: 'fa-volume-mute',
			unmuted: 'fa-volume-up'
		};

		this.selectors = {
			player: '.player',
			playhead: '.track-progress-bar .track-progress',
			playlist: '.menu-playlist-wrapper',
			playlistButton: '#pl-playlist-toggle',
			playlistList: '#playlist-list',
			playlistUnavailableLabel: '#playlist-unavailable-label',
			progressBar: '.track-progress-bar',
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
				this.$element.addEventListener('mouseup', (event) => this.seek(event));
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

			console.debug('sounds off');
		} else {
			this.removeClass(this.classes.muted);
			this.addClass(this.classes.unmuted);

			console.debug('sounds on');
		}
	}


	/**
	 * play
	 * Plays the currently selected song.
	 *
	 * @param {void}
	 * @return {void}
	 */
	play() {
		console.debug('play the current song');
	}


	/**
	 * next
	 * Jumps to the next song in the playlist
	 *
	 * @param {void}
	 * @return {void}
	 */
	next() {
		console.debug('jump to next song');
	}


	/**
	 * previous
	 * Jumps to the previous song in the playlist
	 *
	 * @param {void}
	 * @return {void}
	 */
	previous() {
		console.debug('jump to previous song');
	}


	/**
	 * selectTrack
	 * Finds a given track in the playlist and sets it ready for playing.
	 *
	 * @param  {number} trackId
	 * @return void
	 */
	selectTrack(trackId) {
		console.debug(`play song ${trackId}`);
	}


	/**
	 * seek
	 * Seeks to a different time point of the currently playing song.
	 *
	 * @param {Event} event
	 * @return {void}
	 */
	seek(event) {
		if (!this.select(this.selectors.progressBar)) {
			return;
		}

		const pbRect = this.$element.getBoundingClientRect();
		const seekTarget = 1 - (pbRect.width - (event.clientX - pbRect.x)) / pbRect.width;

		this._movePlayhead(seekTarget * 100); // @todo: don't do it here, make the playback update it automatically

		console.debug(`seek to ${seekTarget * 100} %`);
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

		let percent = Number.parseInt(percentFromStart, 10);
		percent = Number.isNaN(percent) ? 0 : percent;

		this.setStyle({ width: `${percent}%` });
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
				this._displayPlaylist(
					data && data.data && data.data.playlist ? data.data.playlist : []
				);
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
		playlist.forEach(item => {
			playlistTemplate += this._getPlaylistItemTemplate(item.id, item.title, item.duration);
		});

		this.select(this.selectors.playlistList).setHTML(playlistTemplate);
	}


	/**
	 * _getPlaylistItemTemplate
	 *
	 * @param  {number} id
	 * @param  {string} name
	 * @param  {string} duration
	 * @return {string} HTML
	 */
	_getPlaylistItemTemplate(id, name, duration) {
		return `
			<li>
				<a onclick="Player.selectTrack(${id})">
					<span class="playlist-title">${name}</span>
					<span class="playlist-time">${duration}</span>
				</a>
			</li>
		`;
	}
};
