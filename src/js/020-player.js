const Player = new class extends UiElement { // eslint-disable-line
	constructor() {
		super();

		this.classes = {
			muted: 'fa-volume-mute',
			unmuted: 'fa-volume-up'
		};

		this.selectors = {
			volume: '.player-controls .volume' ,
			progressBar: '.track-progress-bar',
			playhead: '.track-progress-bar .track-progress'
		};

		this._init();
	}

	_init() {
		if (!this._isSupported()) {
			return;
		}

		window.onload = () => {
			this._show();

			// we need to use addEventListener, because this is the only way of getting mouse coordinates
			this.select(this.selectors.progressBar).$element.addEventListener('mouseup', (event) => this.seek(event));
		};
	}


	/**
	 * isSupported
	 * Determines if player will work on this browser.
	 *
	 * @param {void}
	 * @return {Boolean}
	 */
	_isSupported() {
		return true;
	}


	/**
	 * show
	 * Display the player and readjust other UI elements for it to fit properly.
	 *
	 * @param void
	 * @return {void}
	 */
	_show() {

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
		const pbRect = this.select(this.selectors.progressBar).$element.getBoundingClientRect();
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
		let percent = Number.parseInt(percentFromStart, 10);
		percent = Number.isNaN(percent) ? 0 : percent;

		this.select(this.selectors.playhead).$element.style.width = `${percent}%`;
	}
};
