
# Mobile Power User
Let's walk through the creation and usage of a simple "Mobile Power User" goal. The purpose of this goal will be to incentivize users to use our company's new mobile application. Users who successfully complete this goal will be awarded a badge that will be put on display in their profile and give them access to additional features.

## Creating the Goal
First we invoke an HTTP POST to create the goal. We use the **Goals** API as follows:

```jsonc
// HTTP POST https://<host>/api/v1/goals

// Request Body
{
  "name": "Mobile Power User",
  "description": "Award a goal to users that log in at least 5 times from our mobile app.",
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
Next, as users log into our application, we invoke an HTTP POST against the jz-gamification-engine **Activities** API.

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

Note that *jz-gamification-engine* only considers key/value combinations that appear in existing goals. This is done to optimize activity processing. In this example, the other activity fields (`clientId` and `foo`) are simply ignored by the engine.

## Checking Progress
Let's invoke an HTTP GET against the **Goal Progress API** to see how close John Doe is to achieving this goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/userId/john-doe-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "userId": "john-doe-1234",
    "goalProgress": {
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
        ],
    }
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
// HTTP GET https://<host>/api/v1/entities/userId/john-doe-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

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

## Seeing John's Progress Towards All Goals

You can generically fetch a user's progress against all configured goals in this manner:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/userId/john-doe-1234/progress

// Response Body
[
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
  },
  {
    "name": "Impossible Goal",
    "isComplete": false,
    "id": "9a69fc07-9ee0-4fb5-860a-9a5fcdbeec9a",
    "criteriaProgress": [
        {
            "description": "Do something impossible.",
            "progress": 0,
            "threshold": 5,
            "id": "2ad583c6-0c08-4a89-83bf-11be4da93923"
        }
    ]
  },
  // ... more goal progress...
]
```



