# Logger
Simple logging service.

## Features
- JSONP compatible
- Heroku compatible
- Uses free Couchdb instance on Cloudant
- HTTP API
- Invisible pixels

## Install
You need to install CouchDB. Follow the instruction [here](http://couchdb.apache.org/). Once ready, download this repository

    ~$ git clone git@github.com:danielepolencic/logger

From within the newly created folder

    ~$ npm install
    ~$ node app.js

Visit the following page: [http://localhost:8080](http://localhost:8080)

## Tests
Run

    ~$ mocha --timeout 5000
