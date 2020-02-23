# dimmusaurus contributing guide

This is a small and very efficient website, that looks good and loads fast on any device, including a powerful PC, a smartphone, and even on an old Nokia phone running Opera Mini. It is aimed to be less than 300 kb on initial load, and less than 30 kb when navigating around.

Hence, no big frameworks or libraries were used, except when they really made difference. Learn [why it is so awesome](https://idlewords.com/talks/website_obesity.htm).

### Technology Stack
* Frontend
  * Vanilla HTML5
  * Vanilla CSS3 + PureCSS 1.0.1 for (resetting the styles)
  * Vanilla ES2015
* Backend
  * Python 3.8 + Pip
  * Django 3.0.2
  * gettext 0.15 _(required by Django for translations)_
  * python-markdown2 _(you may have it by default)_
  * django-markdown-deux
  * sqlite 3.30.1 _(included with Python)_
* Code style
  * nodejs 12.14+
    * csslint
    * eslint
  * html tidy
  * pycodestyle
* Building
  * nodejs 12.14+
    * babel 7 is used for generating JS for older browsers
    * there is a helper node script for building the legacy CSS.
  * make _(There is a Makefile compatible with `bash`)_

### Project Overview
 * `build-tools/` contains helper scripts needed for building and minifying the code. They are meant to be run by the `Makefile`. Normally, you don't have to modify them.
 * `db/` is meant to hold any database backups you make. It is also where the import script looks for files.
 * `img/` contains all the images.
 * `ui-demo/` is the build directory for the demo site. It also servers as temporary directory when building and minifying the code for usage in Django.
 * `src/` contains all the source code, hence all development should happen there. There is a `Makefile` to build the css and the js. A list of all `make` commands is available [here](README.md#available-make-commands). You must use the standard `manage.py` that comes with Django to setup and run the website locally. Detailed instructions are available under ["Running" in README.md](README.md#running).
   * `src/js/`: contains the javascript source
   * `src/css/`: contains the css source
   * `src/py/`: contains the Django project source. `src/py/static/` is the default Django static folder and is going to be populated when you build the JS, the CSS and the images using `Makefile`.

### Linters Setup
Before proceeding make sure you have installed the required software described under ["Requirements" in README.md](README.md#requirements).

Linters are assumed to be installed globally, for the system, so they are _NOT_ included in `package.json` file. Yet, be nice and install the following:
* `$ pip install pycodestyle`
* `$ npm install -g csslint` _(remove `-g` parameter, to install locally)_
* `$ npm install -g eslint` _(remove `-g` parameter, to install locally)_
* HTML Tidy. There are two projects with the same name, but you must use [tidy-html5](https://github.com/htacg/tidy-html5/). _(Do NOT use the NPM package, because it contains an archaic version of HTML Tidy.)_

### Setup and configuration
* `$ npm install`
* `$ cd src/py/`
* Open `pysaurus/settings.py` and set `SITE_HOST`, `SITE_PORT`, `ALLOWED_HOSTS` and `BASE_URL` properly.
  * `SITE_HOST` is either an IP address, or a domain name only. No `http(s)://` should be there. For development, you'd want to set it either to `localhost` or `127.0.0.1`.
  * `SITE_PORT` is an empty string by default. But if, for example, you choose to run on port 3666, you must change it to: `3666`.
  * `BASE_URL` is used for generating absoulte URLs in templates. Usually, you'd only want to ensure the protocol is correct here.

That's it, you are good to go! Go back to README.md file and see [how to start the project](README.md#running). Also, make sure to read the [make commands list](README.md#available-make-commands), to learn how to build only the parts of the project you have worked on.
