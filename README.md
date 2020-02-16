# dimmusaurus
*Version 7.0*

A small, beautiful and fast website for Dimmu Saurus, that works equally good on a powerful PC and on an old Nokia running Opera Mini. It won't be of much use for you unless you are Dimmu Saurus, though.

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
* `$ pip install markdown2`. Required by `django-markdown-deux` and for converting any database markdown content to HTML. _(Your Python version may include it by default)_
* Django 3.0+
  * `$ python -m pip install Django==3.0.2`.
  * If you have several Django apps, you'd want to install it in a `virtualenv`. Check out [Django docs](https://docs.djangoproject.com/en/3.0/intro/install/) how to do this.
  * gettext 0.15+. _(It is available by default in major Linux distributions, but if you don't have it, or you are using a different OS, you need to install it.)_

#### Setup
* `$ npm install`
* `$ cd src/py/`
* Open `pysaurus/settings.py` and set `SITE_HOST`, `SITE_PORT`, `ALLOWED_HOSTS` and `BASE_URL` properly.
  * `SITE_HOST` is either an IP address, or a domain name only. No `http(s)://` should be there.
  * `SITE_PORT` is an empty string by default. But if, for example, you choose to run on port 3666, you must change it to: `3666`.
  * `BASE_URL` is used for generating absoulte URLs in templates. Usually, you'd only want to ensure the protocol is correct here.

#### Database Setup and Management
The project runs on Sqlite3 that comes with Python, so there is no need to install anything extra. Normally, you do not need to take care the database at all, as Django and the build-tools do it for you, but should you need to do so, run: `sqlite3 src/py/db.sqlite3`.

There are `$ make db-backup` and `$ make db-import` commands, for exporting and importing the data. They generate and read a `.tar` containing `.csv`, respectively. Each `.csv` inside the tarball corresponds to a database table and is compatible with sqlite3. See more about the make commands [below](#available-make-commands).

**A note on importing backups:** have in mind that exporting appends the current date and time to the filename, however, the import script will _NOT_ accept a file with such name. `db-import` expects and reads _ONLY_ a `ds.db.tar` file in `db/` directory.

**Warning:** `db-import` will truncate each table before importing the corresponding `.csv` data! Tables not matching a `.csv` file, however, will not be affected.

### Running

#### The entire site
* `$ make django`
* `$ cd src/py/`
* `$ python manage.py runserver [a-port-of-your-choice]`

The site will be available on 127.0.0.1:8000, or at the port you have chosen.

#### The UI Demo
* `$ make ui`
* `$ cd ui-demo/`
* Open the `index.html`

#### Available Make Commands
In case you need to build only a part of the project, or work with the database, the following commands are available:

Django:
* `$ make clean`: cleans up the Django `static` folder.
* `$ make css-prod`: compiles all css into one file, minifies it, then copies it to the Django `static` folder.
* `$ make js-prod`: same as `$ make css-prod` but for javascript.
* `$ make django-static`: builds both the `css` and `js`, and also copies the images to Django `static` folder. This is the default target.
* `$ make translations`: generates or updates .po translation files from python source code. Same as running: `$ django-admin makemessages` command.
* `$ make django`: Runs all the above, making sure the site will run properly.

UI Demo:
* `$ make clean-ui`: cleans up the `ui-demo/` folder.
* `$ make css-ui`: compiles all css into one file and copies it to the `ui-demo/` folder.
* `$ make images`: copies the `images` to `ui-demo/` folder. They don't need building, so they are just copied.
* `$ make js-ui`: same as `$ make css-ui`, but for JavaScript.
* `$ make ui`: runs all the above to build the frontend demo, including copying the necessary `.html` files.

Deployment:
* `$ make db-backup`: exports the data from all content tables to `.csv` files, one per each table, then packs them in a `.tar`. The resulting tarball will be in `db/` directory. Date and time will be appended to the filename, so _**it is safe to run it multiple times**. No backups will be overwritten._
* `$ make db-import`: Looks for a file named `ds.db.tar` in the `db/` directory, created using `$ make db-backup` _(Note the tarball filenames!)_. If the file is found, **for each `.csv`** in the tarball, it **truncates the corresponding table** in the database, **then inserts the new data**. Unrelated tables will not be affected.
* `$ make tar`: builds the django site (including images), then makes a compressed tarball out of it. Also, includes necessary install scripts. Check [Deployment](#deployment) for more info.

### Deployment
First, make sure you have installed all the required software described [above](#requirements).

As a security measure, the intended workflow is to have an admin account locally and use `db-backup` and `db-import` make commands to transfer the database to a remote server. In case you choose to manage the database on the remote machine, just create an admin account there instead of locally, and skip database steps from the instructions below.

In both cases, follow [Django Docs](https://docs.djangoproject.com/en/3.0/intro/tutorial02/) to create the admin account.

#### Preparing the deployment

To create an installation archive, and export your local database:
```
$ make tar && make db-backup
```

Now copy the tarball and the database backup from `db` directory to the remote server.

#### Deployment

TODO: ...
