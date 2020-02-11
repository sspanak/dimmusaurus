# dimmusaurus
*Version 7*

A small, beautiful and fast website for Dimmu Saurus, that works equally good on powerful PCs and old Nokias running Opera Mini. It won't be of much use for you unless you are Dimmu Saurus.

Visit http://dimmu-saurus.net.
_**Note:** The project still work-in-progress, so it isn't online._

### Setup and Building
The project runs in a bash-compatible terminal. If you are going to write any code, check the [CONTRIBUTING.md](CONTRIBUTING.md) guide after you are done with the setup.

#### Requirements
* node 12.14+
* npm 6.13+ _(usually, comes with node)_
* Python 3.6, 3.7 or 3.8 _(3.8 recommended)_
* sqlite 3+ _(usually, comes with Python)_
* Pip 3 _(usually, comes with Python, but if you don't have it: `$ python3.8 -m pip install pip`)_
* `$ pip install django-markdown-deux`: enables usage of `.md` files as templates.
* `$ pip install markdown2`. Required for converting markdown bits from the database and by `django-markdown-deux`. _(Your Python version may include it by default)_
* Django 3.0+
  * `$ python -m pip install Django==3.0.2`.
  * If you have several Django apps, you'd want to install it in a `virtualenv`. Check out Django docs how to do this.
  * gettext 0.15+. _(It is available by default in major Linux distributions, but if you don't have it, or you are using a different OS, you need to install it.)_

#### Setup
* `$ npm install`
* `$ cd src/py/`
* Open `pysaurus/settings.py` and set `SITE_HOST`, `SITE_PORT`, `ALLOWED_HOSTS` and `BASE_URL` properly.
  * `SITE_HOST` is either an IP address, or a domain name only. No `http(s)://` should be there.
  * `SITE_PORT` is an empty string by default. But if, for example, you choose to run on port 3666, you must change it to: `3666`.
  * `BASE_URL` is used for generating absoulte URLs in templates. Usually, you'd only want to ensure the protocol is correct here.

#### Database Setup and Management
The project runs on Sqlite3 that comes with Python, so there is no need to install anything extra. Normally, you do not need to open the database at all, as Django and the build-tools take care of it, but should you need to do so, run: `sqlite3 src/py/db.sqlite3`.

There are `make db-backup` and `make db-import` commands, for exporting and importing the data. They generate and read a `.tar` containing `.csv`, respectively. Each `.csv` inside the tarball corresponds to a database table and is compatible with sqlite3. See more about the make commands [below](#available-make-commands).

**A note on importing backups:** have in mind that exporting appends the current date and time to the filename, however, the import script will _NOT_ accept a file with such name. `make db-import` expects and reads _ONLY_ a `ds.db.tar` file in `db/` directory.

**Warning:** `db-import` will truncate each table before importing the corresponding `.csv` data! Tables not matching a `.csv` file, however, will not be affected.

### Running

#### The entire site
* `$ make`: builds and minifies the `css` and the `js`, and copies them and the images to the Django `static` folder.
* `$ django-admin compilemessages` - builds all translations from `.po` files
* `$ python manage.py migrate` - runs database migrations
* `$ python manage.py runserver [a-port-of-your-choice]` - runs the server.

The site will be available on 127.0.0.1:8000, or at the port you have chosen.

#### The UI Demo
* `$ make ui` - builds the `css` and the `js`, and copies the images to `ui-demo` folder.
* `$ cd ui-demo/`
* Open the `index.html`

#### Available Make Commands
In case you need to build only one part of the project, the following commands are available:

Django:
* `$ make clean`: cleans up the Django `static` folder.
* `$ make css-prod`: compiles all css into one file, minifies it, then copies it to the Django `static` folder.
* `$ make js-prod`: same as `make css-dev` but for javascript.
* `$ make pystatic`: Builds both the `css` and the `js`, and copies the images to Django `static` folder, making sure, all resources are ready to use. This is the default `make` target.

UI Demo:
* `$ make clean-ui`: cleans up the `ui-demo/` folder.
* `$ make css-ui`: compiles all css into one file and copies it to the `ui-demo/` folder.
* `$ make images`: copies the `images` to `ui-demo/` folder. They don't need building, so they are just copied.
* `$ make js-ui`: same as `make css-ui`, but for JavaScript.
* `$ make ui`: runs all commands to build the frontend demo, including copying the necessary `.html` files.

Database specific commands are:
* `$ make db-backup`: exports the data from all content tables to `.csv` files, one per each table, then packs them in a `.tar`. The resulting tarball will be in `db/` directory. Date and time will be appended to the filename, so _**it is safe to run it multiple times**. No backups will be overwritten._
* `$ make db-import`: Looks for a file named `ds.db.tar` in the `db/` directory, created using `$ make db-backup` _(Note the tarball filenames!)_. If the file is found, **for each `.csv`** in the tarball, it **truncates the corresponding table** in the database, **then inserts the new data**. Unrelated tables will not be affected.

### Deployment
TODO: Not yet available.
