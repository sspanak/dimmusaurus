const Logger = new class { // eslint-disable-line
	constructor() {
		this.enabled = true;
	}

	log(message) {
		if (this.enabled) {
			console.log(message); // eslint-disable-line
		}
	}

	warn(message) {
		if (this.enabled) {
			console.warn(message); // eslint-disable-line
		}
	}

	error(message) {
		if (this.enabled) {
			console.error(message); // eslint-disable-line
		}
	}
};
