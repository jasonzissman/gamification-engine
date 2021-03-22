# Gamification Engine
A platform that enables gamification for other applications.

# Running the app
```
npm start
```

# Optional ENV variables
```
DB_CONN_STRING // database connection string
PORT // port this application listens on
```

# Running Tests

```
npm install --save-dev mocha
npm test
```


# System Architecture
More info coming

# TODO!!!!
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Put index on appropriate fields in Mongo, e.g. id
* Cache calls to database
* General authorization approach
* Put in timing/profiling options to warn if things are going too slow