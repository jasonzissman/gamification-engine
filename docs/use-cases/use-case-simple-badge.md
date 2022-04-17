
# A Badge that Encourages Mobile App Adoption
Imagine that you want to create a "Mobile Power User" goal in order to incentivize users to use your company's new mobile application. Users who successfully complete this goal will be awarded a badge that will be put on display in their profile and will give them access to additional features.

## Creating the Goal
First we need to define our "Mobile Power User" goal in jz-gamification-engine. We use the **Goals** API as follows:

```jsonc
// HTTP POST https://<host>/api/v1/goals

// Request Body
{
  "name": "Mobile Power User",
  "description": "Awarded to users that log in at least 5 times from our mobile app.",
  "criteria": [
    {
      "description": "Log in 5 times from our mobile app.",
  	  "targetEntityIdField": "userId",
      "qualifyingEvent": {
        "action": "logged-in",
        "platform": "mobile-app"
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 5
    }
  ]
}

// Response Body
{
    "status": "ok",
    "goalId": "fb1e71f7-2cc2-4194-b69c-919f8039afcb"
}
```

You can read this goal as *A goal that is completed after jz-gamification-engine receives 5 events with `action=logged-in` and `platform=mobile-app` for a given `userId`*.

## Reporting Activity
Next, we need to inform the engine as login activity occur in our application. For each application login we invoke an HTTP POST against the jz-gamification-engine **Activities** API"

> The platform will eventually support integration with event brokers like Kafka so that clients do not have to send requests directly to the engine.

```jsonc
// HTTP POST https://<host>/api/v1/activities

// Request Body
{
  "clientId": "client-app-1234",
  "action": "logged-in",
  "platform": "mobile-app",
  "userId": "john-doe-1234",
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}
```

You can read this activity as "John Doe logged in using the mobile app". This activity matches the `criteria.[].qualifyingEvent` and `criteria.[].targetEntityIdField` fields defined in our *Mobile Power User* goal; consequently, John Doe has now made progress towards achieving this goal.

Note that jz-gamification-engine only processes key/value combinations that exist in configured goals. This is done to optimize activity processing. In this example, the other activity fields (`clientId` and `foo`) are simply ignored by the engine.

## Checking Progress Towards this Goal
Let's invoke an HTTP GET against the **Goal Progress API** to see how close John Doe is to achieving this goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Mobile Power User",
    "isComplete": false,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Log in 5 times from our mobile app.",
            "progress": 1,
            "threshold": 5,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}
```

## Finishing the Goal

John has not yet completed the required criteria to satisfy this goal since he has only logged into the mobile app one time. Let's simulate John logging into the mobile app 4 more times:

```jsonc
// HTTP POST https://<host>/api/v1/activities (x4)

// Request Body (x4)
{
  "clientId": "client-app-1234",
  "action": "logged-in",
  "platform": "mobile-app",
  "userId": "john-doe-1234",
  "foo": "bar"
}

// Response Body (x4)
{
    "status": "received"
}
```

We'll check the **Goal Progress API** one more time to see John's progress towards this specific goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Mobile Power User",
    "isComplete": true,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "completionTimestamp": 1650022019914,
    "criteriaProgress": [
        {
            "description": "Log in 5 times from our mobile app.",
            "progress": 5,
            "threshold": 5,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}
```

## Seeing All Goals Completed by a User
Your application will likely need to periodically check which goals a user has finished in order to enable special features or display badges correctly. For example - we want to display John's *Mobile Power User* badge correctly the next time he loads his profile page. The **Goal Progress API** will let you see all the goals users have completed so that you can enable functionality accordingly:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress?onlyComplete=true

// Response Body
[{
    "name": "Mobile Power User",
    "isComplete": true,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "completionTimestamp": 1650022019914,
    "criteriaProgress": [
        {
            "description": "Log in 5 times from our mobile app.",
            "progress": 5,
            "threshold": 5,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}]
```
