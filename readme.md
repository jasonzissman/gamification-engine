# JZ Gamification Engine
jz-gamification-engine is a robust platform for managing gamification features such as badges, awards, user assignments, and point systems. It is meant to be run alongside existing applications that want to support gamification features in a decoupled, performant fashion.

What does this look like in practice? Think about some of the following features. All of them are made possible, trivially, with jz-gamification-platform:

* The ability for end users to define, enable, and disable powerful custom badges during runtime. For example:
    * A "Mobile Power User" badge that users receive after logging into your mobile app 5 times.
    * A "Bookworm" badge that users receive after spending at least 20 minutes reading content on your website.
* The ability to define journeys that tie together disparate actions. For example:
    * A "Newcomer" journey that a user completes after visiting 3 tutorial pages and writing a first blog post.  After completion additional functionality is unlocked.
* The ability to define goals for more than just users. For example:
    * A "Popular Kids" badge that a **group** of users is awarded after blog posts written by their users are read 100 times.
* An in-app store that allows users to choose custom profile images and flair using points earned from completing goals.

## Usage Overview
Three flows are made available via the gamification-engine APIs:

1. Client defines a `goal`
2. Client sends usage `events` as actions are completed by entities 
3. Client checks an `entity`s' progress towards goals 
4. *push notifications coming later*

Conceptually, these flows enable a complete lifecycle for most gamification features.

## Example Goal: The 'Mobile Power User' Badge
Let's walk through the creation and usage of a simple "Mobile Power User" badge. This badge will be awarded to users who log into our mobile app at least 5 times.

### Creating the Badge
First we invoke an HTTP POST to create the badge. Use the `/goal` API as follows. 

```
// HTTP POST <host>:<port>/goal
{
  "name": "Mobile Power User",
  "description": "Log in at least 5 times on a mobile device",
  "targetEntityIdField": "userId",
  "criteria": [
    {
      "qualifyingEvent": {
        "action": "log-in",
        "platform": "mobile"
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 5
    }
  ]
}
```

Our API section will provide further detail the request payload, but you can read this goal as *A badge that is completed for a given `userId` after the gamification system receives 5 events with `action=log-in` and `platform=mobile` for that `userId`*.

### Sending Usage Events
Next we invoke an HTTP POST against the jz-gamification-engine `/event` API as users log into our application. 

```
// HTTP POST <host>:<port>/event
{
  "action": "log-in",
  "platform": "mobile",
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

This API is pretty generic. The events that you send should include enough information to match the `goal.criteria` and `targetEntityIdField` that you provided when creating your goal.

### Checking Goal Progress
Finally, as needed, we invoke an HTTP GET against the `/event` API as users log into our application. 

```
// HTTP GET <host>:<port>/entity/<entity-id>/progress
```

This will return a breakdown of each user's progress towards all goals, including our Power User badge. Note that this API will return empty/missing if no progress has been made towards a specific goal or goal criteria.

## Development Overview

### Setup
```
npm install
```

### Running Unit Tests

```
npm run unit-test
```

### Running Integration Tests

```
npm run integration-test
```

### Running the app
```
npm start
```

### Optional ENV variables
```
DB_CONN_STRING // database connection string
PORT // port this application listens on
```

### System Architecture
More info coming

### Detailed APIs
More info coming

## TODO!!!!
* Push notifications when goal completed.
* allow assignment of 'points' after an individual completes a goal. Have a balance? e.g. like a wallet for purchasing features.
* event processing should be locked down. Don't want two updates to overwrite each other. 
* More unit and integration tests
* Update readme
* Can we support a broader character set for goals and events? Feels needlessly restrictive right now.
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Cache calls to database
* General authorization approach. Access tokens?
* Put in timing/profiling options to warn if things are going too slow