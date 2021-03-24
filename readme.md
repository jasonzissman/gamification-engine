# Gamification Engine
A platform that enables gamification for other applications.

# Setup
```
npm install
```

# Running Unit Tests

```
npm run unit-test
```

# Running Integration Tests

```
npm run integration-test
```

# Running the app
```
npm start
```

# Optional ENV variables
```
DB_CONN_STRING // database connection string
PORT // port this application listens on
```




# System Architecture
More info coming

# TODO!!!!
* More unit and integration tests
* Support description field on goals
* Update readme
* Can we support a broader character set for goals and events? Feels needlessly restrictive right now.
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Cache calls to database
* General authorization approach
* Put in timing/profiling options to warn if things are going too slow