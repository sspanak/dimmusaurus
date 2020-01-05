# dimmusaurus
A website for Dimmu Saurus, reincarnation 7.

### Technologies
* Frontend
  * Plain HTML
  * Plain CSS and PureCSS 1.0.1 for (resetting the styles)
  * Plain ES6
* Backend
  * Python 3.8
  * Django 3.0.2
  * gettext 0.15 _(required by Django for translations)
* Code style
  * npm _(Note that npm is NOT needed to run the project, it is just for installing the linters)_
  * csslint
  * eslint
  * html tidy
* Makefile compatible with `bash`

### Setup
All the source code is in `src/` folder, hence all development should happen there. There is a `Makefile` to build the .css and .js. `make` commands are available below.

#### Python, Django and database setup
* Install Python 3.8 by the means of your operating system.
* Install Django 3.0
  * Just do: `python -m pip install Django`.
  * If you have several Django apps, you'd want to install it in a `virtualenv`. Check out Django docs how to do this.

#### Linting
Linting is meant to be done using globally installed tools. However, you can use `npm` to install them in your project directory, as well.

* Install html tidy by the means of your operating system.
* Install frontend linters
  * First, you need to install `npm`. Do so by the means of your operating system.
  * `npm install -g csslint`
  * `npm install -g eslint`
* Install Python linter `pip install pycodestyle`

 You might as well install them in the project instead of globally.

### Building
TODO: Not yet available

#### Available make commands
In case you need to build only one part of the project, the following commands are available.

* `make css-ui`: compiles all css into one file and copies it to the `ui-demo` folder.
* `make clean`: cleans up the `ui-demo/` folder.
* `make images`: copies the `images` to `ui-demo/` folder. They don't need building, so they are just copied.
* `make js-ui`: same as `make css-ui`, but for JavaScript.
* `make ui`: runs all commands to build the frontend demo, including copying the necessary `.html` files.

TODO: Update the list when the backend is created.

### Deployment
TODO: Not yet available.
