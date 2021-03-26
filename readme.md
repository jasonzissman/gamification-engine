# JZ Gamification Engine
jz-gamification-engine is a robust platform for managing gamification features such as badges, awards, user assignments, and point systems. It is meant to be run alongside existing applications that want to support gamification features in a decoupled, performant fashion.

## Some Example Features 
Think about the following features. All of them are made possible with jz-gamification-platform:

* The ability to define, enable, and disable custom badges. For example:
    * A "Mobile Power User" badge that users receive after logging into your mobile app 5 times.
    * A "Bookworm" badge that users receive after spending at least 20 minutes reading content on your website.
    * A "Best Seller" badge that a **blog post** is awarded after it is read 100 times.
* The ability to define journeys that tie together disparate actions. For example:
    * A "Newcomer" journey that a user completes after visiting 3 tutorial pages and writing a first blog post. After completion additional functionality is unlocked.    
* The ability for goals to be defined and updated dynamically during run time, even by your end-users themselves. 
* An in-app store that allows users to choose custom profile images and flair using points earned from completing goals.

## Example: The 'Mobile Power User' Badge
All of the features above are enabled via three flows made available via the gamification-engine APIs:

1. Client defines a `goal`
2. Client sends usage `events` as actions are completed by entities 
3. Client checks an `entity`s' progress towards goals (*push notifications coming later*)

Let's walk through the creation and usage of a simple "Mobile Power User" badge. This badge will be awarded to users who log into our mobile app at least 5 times.

### Creating the Badge
First we invoke an HTTP POST to create the badge. Use the `/goal` API as follows:

```
// HTTP POST 
// https://<host>/goal
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

Our API section will provide further detail about the request payload, but `events` are the basic currency of the engine. You can read this goal as *A badge that is completed for a given `userId` after the gamification system receives 5 events with `action=log-in`, `platform=mobile`, and `userId=*`*.

### Sending Usage Events
Next, as users log into our application, we invoke an HTTP POST against the jz-gamification-engine `/event` API:

```
// HTTP POST 
// https://<host>/event
{
  "action": "log-in",
  "platform": "mobile",
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

This API is very generic and **has no globally required fields**. However to be valuable, the events that you send should include enough information to match the `goal.criteria` and `targetEntityIdField` fields that you provided when creating your goal. In our case, our example event includes `action`, `platform`, and `userId`, as our "Power User" goal requires.

### Checking Goal Progress
Finally, as needed, we invoke an HTTP GET against the `/entity/<entityId>` API to see how users are tracking towards their goals.

```
// HTTP GET 
// https://<host>/entity/<entity-id>
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
* Can we support a broader character set for goals and events? Feels needlessly restrictive right now.
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Push notifications when goal completed.
* More unit and integration tests
* Update readme
* Cache calls to database
* General authorization approach. Access tokens?
* Put in timing/profiling options to warn if things are going too slow