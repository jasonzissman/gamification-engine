# JZ Gamification Engine
jz-gamification-engine is a platform for managing gamification features such as badges, awards, user journeys, and point systems. It is meant to be run alongside existing applications that want to support these features in a decoupled, performant fashion.

## Stability and Version
As of March 2021, this project is very young. I welcome feedback and suggestions from everyone, but keep in mind that this platform is not yet battle tested.

## Some Example Features 
Think through the following features which are enabled by jz-gamification-engine:

* The ability to define, enable, and disable custom badges. For example:
    * A "Mobile Power User" badge that users receive after logging into your mobile app 5 times.
    * A "Bookworm" badge that users receive after spending at least 20 minutes reading content on your website.
    * A "Best Seller" badge that a blog post author is awarded after his/her blogs are read 1000 times.
* The ability to define journeys that tie together disparate actions. For example:
    * A "Newcomer" journey that a user completes after visiting 3 tutorial pages and writing a first blog post. After completion additional functionality is unlocked.
* The ability for goals to be defined and updated dynamically during run time, even by your end-users themselves. 
* An in-app store that allows users to choose custom profile images and flair using points earned from completing goals.

All of the features above are enabled via three simple flows made available by the engine APIs:

1. Define `goals` that are relevant to your application.
2. Send usage `events` as users interact with your applcation.
3. Check any `entity's` progress towards goals (*push notifications coming later*)

## Simple Example: The 'Mobile Power User' Badge

Let's walk through the creation and usage of a simple "Mobile Power User" badge. This badge will be awarded to users who log into our mobile app at least 5 times.

### Creating the Badge
First we invoke an HTTP POST to create the badge. Use the jz-gamification-engine `/goals` API as follows:

**Request**
```
// HTTP POST 
// https://<host>/goals
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

You can read this goal as *A badge that is completed for a given `userId` after the gamification system receives 5 events with `action=log-in`, `platform=mobile`, and `userId=*`*.

### Sending Usage Events
Next, as users log into our application, we invoke an HTTP POST against the jz-gamification-engine `/events` API:

**Request**
```
// HTTP POST 
// https://<host>/events
{
  "action": "log-in",
  "platform": "mobile",
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

To track progress towards your goal, the events that you send should include enough information to match the `criteria.[].qualifyingEvent` and `targetEntityIdField` fields that you provided when creating your goal. In our case, our example event includes `action=log-in`, `platform=mobile`, and `userId`, which is what our "Power User" goal requires.

### Checking Goal Progress
Finally, we invoke an HTTP GET against the `/entities/<entityId>` API to see how users are tracking towards their goals. *Note that support for push notifications upon goal completion will come later*

**Request**
```
// HTTP GET 
// https://<host>/entities/john-doe-1234
```

**Response**
```
{
    entityId: 'john-doe-1234',
    points: 0, // no points accumulated yet since goal no completed
    goals: {
        goal-1234-5678: {
            criteriaIds: {
                criteria-9999: {
                    isComplete: false, // criteria conditions have not been met yet
                    value: 1 // needs to be 5 to meet goal criteria
                }
            },
            isComplete: false // goal criteria have not been met yet
        }
    }
}
```
This will return a breakdown of the user's progress towards all goals, including our Power User badge. 

Our [API documentation](docs/api.md) provides further detail.

## More Example Use Cases

* [Badge for users who log in 5 times](docs/use-case-simple-badge.md)
* [Badge tracking time spent reading a page](docs/use-case-track-time-on-page.md)
* [Badge that author receives when his blog posts are read 1000 times](docs/use-case-track-blog-post-reads.md)

## Running the sample application

There is a fully functional sample application bundled in this repository under `<root>/docs/sample_app`. It demonstrates a client app using the gamification engine to track user progress towards goals.

To run the sample app, perform the following steps:
```
cd ROOT_DIR
npm install // run this at root project directory, not sample_app directory!
cd docs/sample_app
npm install
npm start
// ... wait to start and then
// navigate to http://localhost:31854/static
```

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
// assumes locally running Mongo at "mongodb://localhost:27017".
// Otherwise, override process.env.DB_CONN_STRING
npm start
```

### Detailed APIs
[Detailed API documentation](docs/api.md)

### System Architecture and Design
[Detailed system architecture documentation](docs/system-architecture.md)


## TODO!!!!
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Can we make this Docker friendly?
* Swagger
* Can we support a broader character set for goals and events? Feels needlessly restrictive right now.
* Push notifications when goal completed.
* More unit and integration tests
* Cache calls to database
* General authorization approach. Access tokens?
* Put in timing/profiling options to warn if things are going too slow