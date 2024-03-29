# dimmusaurus
*Version 7.15*

A small, beautiful and fast wiki-like site for Dimmu Saurus, that works equally good on a powerful PC and on an old Nokia running Opera Mini.

Visit http://dimmu-saurus.net.

### Setup and Building
The project runs in a bash-compatible terminal. If you are going to write any code, check the [contributing guide](CONTRIBUTING.md) after you are done with the setup.

#### Requirements
* **Apache 2.4** + **mod_wsgi** _(production only)_
* **nodejs 14.18+** _(development only; 16.11+ recommended)_
* **Python 3** _(3.8, 3.9 or 3.10)_
* **sqlite 3.8.3+** _(3.31+ recommended; it is usually included with Python, but you may need to install it manually)_
* **Pip 3**
* **markdown2** python package. Required for converting any database markdown content to HTML. _(Your Python version may include it by default. Install with `$ pip install -r requirements.txt`.)_
* **Django 4.0+** _(Install with `$ pip install -r requirements.txt`; Latest 4.x recommended)_
  * If you have several Django apps, you'd want to install it in a `virtualenv`. Check out [Django docs](https://docs.djangoproject.com/en/3.0/intro/install/) how to do this.
  * **gettext 0.15+**. _(It is available by default in major Linux distributions, but if you don't have it, or you are using a different OS, you need to install it.)_

For Debian 11, there is a script that can install everything automatically. Check [Deployment](#Deployment) for details.

#### Configuration
As per [Django docs](https://docs.djangoproject.com/en/3.0/topics/settings/), you must set host and port, before running. Installation scripts take care of this automatically, but if you are running locally, or need to do it manually, keep reading.

To change settings:
* `$ cd src/py/`
* Open `pysaurus/settings.py` and set `SITE_HOST`, `SITE_PORT` and `BASE_URL` properly.
  * `SITE_HOST` is either an IP address, or a domain name only. No `http(s)://`.
  * `SITE_PORT` is an empty string by default. Leave it blank unless the site is going to be accessed at a non-standard port, for example `some-domain.com:3666`.
  * `BASE_URL` is used for generating absolute URLs in templates.

#### Database Setup and Management
The project runs on Sqlite3 that comes with Python, so there is no need to install anything extra. Normally, you do not need to take care the database at all, as Django and the build-tools do it for you, but should you need to do so, run: `sqlite3 src/py/db.sqlite3`.

There are `$ make db-backup` and `$ make db-import` commands, for exporting and importing the data. They generate and read a `.tar` containing `.csv`, respectively. Each `.csv` inside the tarball corresponds to a database table and is compatible with sqlite3. See more about the make commands [below](#available-make-commands).

**Warning:** `db-import` will truncate each table before importing the corresponding `.csv` data! Tables not matching a `.csv` file, however, will not be affected.

**A note on importing backups with the make command:** have in mind that exporting appends the current date and time to the filename, however, `make db-import` expects and reads _ONLY_ a `ds.db.tar` file from `db/` directory. If you require flexibility, use the `db-import.sh` script directly.


### Running
This section is for running the site locally.

#### The entire site
* `$ make django`
* `$ cd dist/py/`
* `$ python3 manage.py runserver [a-port-of-your-choice]`

The site will be available on 127.0.0.1:8000, or at the port you have chosen.

#### The UI Demo
* `$ make ui`
* `$ cd dist/`
* Open the `index.html` or run `$ make serve-ui` and open `localhost:3000`.


### Deployment
This website is intended to run on a Debian 11 server. There is a `setup-debian11.sh` script for installing all the required software and `setup-project.sh` for installing the site itself. Historically it used to run on Ubuntu Server 16.04, so there is a script for setting it up, however, many packages in that distribution are outdated, so using it is not recommended.

If you choose another distribution, you will have to install all [requirements](#requirements) manually. `setup-project.sh` should work with minimal changes in the Apache setup section.

**Note about the content:** As a security measure, the intended workflow is to have an admin account locally and use `db-backup` and `db-import` make commands to transfer the database to a remote server. In case you choose to manage the database on the remote machine, just create an admin account there instead of locally, and skip database steps from the instructions below.

In both cases, follow [Django Docs](https://docs.djangoproject.com/en/4.0/intro/tutorial02/#introducing-the-django-admin) to create the admin account.

#### Server setup
Make sure to create a user with root privileges. You are going to need one (but not the "root" superuser) to install the website. Follow [this guide](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-centos-7).

#### Building installation tarball

To create an installation archive, and export your local database, run locally:
```
$ make tar && make db-backup
```

Now copy the tarball and the database backup from `db` directory to the remote server.

#### Installing
The setup script is assumed to run on a brand new server that doesn't have anything installed. It will install or replace Apache, mod_wsgi, Python 3.9.

* ssh to your server, making sure you are not "root".
* `$ mkdir upload && tar xvf ds.tar.bz2 -C upload/ && cd upload` to extract the tarball
* `$ sudo ./setup-debian11.sh` to install all requirements _(or do it manually on other distributions)_.
* `$ ./setup-project.sh --all` to install the site itself. It will prompt where to put the site and what hostname and port it will run on. You may leave them blank and use the defaults.
* `$ ./db-import.sh database-backup-name.tar target-database.sqlite3` to import the data into Sqlite.
* Ensure the project directory and its parent(s) have the executable flag, otherwise Apache will not able to access them. The `setup-project.sh` script takes care of the website itself, but you may want to double check the parent directory in case you get `403 Forbidden`, when you try to access the site.

That's it! Now open it in your browser.


#### Enabling SSL/HTTPS with certbot
If you are going to enable HTTPS with certbot, be aware there is a [known incompatibility](https://github.com/certbot/certbot/issues/4880) between it and Python WSGI definitions in Apache virtual hosts.

##### Initializing a HTTPS vhost for the first time
1. Go to the directory where your Apache virtual hosts are _(for example: /etc/apache2/sites-available/)_.
2. Comment out all the "WSGI..." lines in the virtual host file.
3. Run `[sudo] certbot --apache -d dimmu-saurus.net` normally.
4. Uncomment the "WSGI..." lines **in the autogenerated `xxxxx-le-ssl.conf`** virtual host file (for https/port 443) and keep them commented in the standard file (for http/port 80).
5. Restart Apache.

##### Updating a HTTPS vhost
1. Go to the directory where your Apache virtual hosts are _(for example: `/etc/apache2/sites-available/`)_.
2. Comment out all the "WSGI..." lines in the HTTP `.conf` file.
3. Delete the HTTPS `.conf` file _(the one named: `xxxxx-le-ssl.conf`)_.
4. Run `[sudo] certbot --apache` normally.
5. Uncomment the "WSGI..." lines **in the autogenerated `xxxxx-le-ssl.conf`** virtual host file (for https/port 443) and keep them commented in the standard file (for http/port 80).
6. Restart Apache.


### Available Make Commands
In case you need to build only a part of the project, or work with the database, the following commands are available:

##### Django:
* `$ make clean`: cleans up the `dist` folder.
* `$ make css`: compiles all css into one file, minifies it, then copies it to the Django `static` folder.
* `$ make js`: same as `$ make css` but for javascript.
* `$ make django-static`: copies `py` source code and translations, builds the `css` and `js`, copies the images to Django `static` folder. This is the default target. **Important:** This commands creates  *a link* to the database in `src/py/`, not a copy, so making any changes to the data will affect the original file.
* `$ make translations`: generates or updates .po translation files from python source code. Same as running: `$ django-admin makemessages` command.
* `$ make django`: Runs all the above, but also installing all requirements, making sure the site will run properly.

##### UI Demo:
* `$ make clean`: cleans up the `dist/` folder.
* `$ make css-debug`: compiles all css into one file without minifying it.
* `$ make images`: images don't need building, so they are just copied.
* `$ make js-debug`: same as `$ make css-debug`, but for JavaScript.
* `$ make ui`: runs all the above to build the frontend demo, including copying the necessary `.html` files.

##### Deployment:
* `$ make db-backup`: exports the data from all content tables to `.csv` files, one per each table, then packs them in a `.tar`. The resulting tarball will be in `db/` directory. Date and time will be appended to the filename, so _**it is safe to run it multiple times**. No backups will be overwritten._
* `$ make db-import`: Looks for a file named `ds.db.tar` in the `db/` directory, created using `$ make db-backup` _(Note the tarball filenames!)_. If the file is found, **for each `.csv`** in the tarball, it **truncates the corresponding table** in the database, **then inserts the new data**. Unrelated tables will not be affected.
* `$ make tar`: builds the django site (including images), then makes a compressed tarball out of it. Also, includes necessary install scripts. Check [Deployment](#deployment) for more info.


### License
The source code and the logo image are licensed under the conditions described in [LICENSE.txt](LICENSE.txt). "Griffy" font is under [SIL Open font license](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL). "Noto Sans" font is licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0). All other libraries are under the respective licenses provided with their source code.
