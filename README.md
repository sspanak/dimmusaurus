# dimmusaurus
A website for Dimmu Saurus, reincarnation 7.

### Technologies
The goal of this project is to be as simple and as small as possible. It is a five page website, after all. Hence, no big frameworks or libraries were used, except when they really made difference.

* Frontend
  * Vanilla HTML5
  * Vanilla CSS3 + PureCSS 1.0.1 for (resetting the styles)
  * Vanilla ES6 _(2018 standard was not used for better browser compatibility... sadly...)_
* Backend
  * Python 3.8 + Pip
  * Django 3.0.2
  * gettext 0.15 _(required by Django for translations)_
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

### Development Setup
#### Project overview
 * `build-tools` contains helper scripts needed for building and minifying the code. They are meant to be run by the `Makefile`. Normally, you don't have to modify them.
 * `img` constains all the images
 * `ui-demo` is the build directory for the demo site. It also servers as temporary directory when building and minifying the code for usage in Django.
 * `src/` contains all the source code, hence all development should happen there. There is a `Makefile` to build the `.css` and `.js`. A list of all `make` commands is available [below](#available-make-commands). You must use the standard `manage.py` that comes with Django to setup and run the website locally. Detailed instructions are available under [Running](#running).
   * `src/js`: contains the javascript source
   * `src/css`: contains the css source
   * `src/py`: contains the Django project source. `src/py/static` is the default Django static folder and is going to be populated when you build the JS, the CSS and the images using `Makefile`.

#### Python, Django and database setup
* Install Python 3.8 by the means of your operating system.
* Install Django 3.0
  * Just do: `python -m pip install Django`.
  * If you have several Django apps, you'd want to install it in a `virtualenv`. Check out Django docs how to do this.

#### Linters setup
Linting is meant to be done using globally installed tools. However, depending on your IDE, you may choose to install them locally.

* Install html tidy by the means of your operating system.
* Install frontend linters:
  * First, you need to install `npm`. Do so by the means of your operating system.
  * `npm install -g csslint` (remove `-g` parameter, to install locally)
  * `npm install -g eslint` (remove `-g` parameter, to install locally)
* Install Python linter: `pip install pycodestyle`

 You might as well install them in the project instead of globally.

### Running

#### The entire site
* `make` - builds and minifies the `css` and the `js`, and copies them and the images to the Django `static` folder.
* `cd src/py`
* `django-admin compilemessages` - builds all translations from `.po` files
* `python manage.py runserver [a-port-of-your-choice]` - runs the server

The site will be available on 127.0.0.1:8000, or at the port you have chosen.

#### The UI Demo
* `make ui` - builds the `css` and the `js`, and copies the images to `ui-demo` folder.
* `cd ui-demo`
* Open the `index.html`

#### Available make commands
In case you need to build only one part of the project, the following commands are available.

Django:
* `make clean`: cleans up the Django `static` folder.
* `make css-prod`: compiles all css into one file, minifies it, then copies it to the Django `static` folder.
* `make js-prod`: same as `make css-dev` but for javascript.
* `make pystatic`: Builds both the `css` and the `js`, and copies the images to Django `static` folder, making sure, all resources are ready to use. This is the default `make` target.

UI Demo:
* `make clean-ui`: cleans up the `ui-demo/` folder.
* `make css-ui`: compiles all css into one file and copies it to the `ui-demo` folder.
* `make images`: copies the `images` to `ui-demo/` folder. They don't need building, so they are just copied.
* `make js-ui`: same as `make css-ui`, but for JavaScript.
* `make ui`: runs all commands to build the frontend demo, including copying the necessary `.html` files.

### Deployment
TODO: Not yet available.
