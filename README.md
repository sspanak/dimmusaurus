# dimmusaurus
A website for Dimmu Saurus, reincarnation 7.

### Technologies
* Frontend
  * Plain HTML
  * Plain CSS and PureCSS for (resetting the styles)
  * Plain ES6
* Backend
  * Python 3 + Django 3
* Code style
  * csslint
  * eslint
  * html tidy
* Makefile compatible with `bash`

### Setup
All the source code is in `src/` folder, hence all development should happen there. There is a `Makefile` to build the project in `dist/`. `make` commands are available below.

#### Python, Django and database setup
TODO: Not yet available

#### Linting
Linting is meant to be done using globally installed tools.

* Install html tidy by the means of your operating system.
* Install npm by the means of your operating system. Then install the linters.
  * `npm install -g csslint`
  * `npm install -g eslint`

 You might as well install them in the project instead of globally.

### Building
* `make images`
* `make`

That's it! The site is ready for upload in `dist/` folder.

#### Available make commands
In case you need to build only one part of the project, the following commands are available.

* `make css`: compiles all css into one file and minifies it.
* `make clean`: cleans up the `dist/` folder.
* `make images`: copies the `images` to `dist/` folder. They don't need building, so they are just copied.
* `make js`: same as above, but for JavaScript.
* `make ui`: runs all commands to build the frontend, including copying the necessary `.html` files.

TODO: Update the list when the backend is created.

### Deployment
TODO: Not yet available.
