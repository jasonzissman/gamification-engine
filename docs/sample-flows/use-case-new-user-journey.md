
# Mobile Power User
Let's walk through the creation and usage of a simple "New Guy in Town" user journey. The purpose of this goal will be to educate new users on basic functionality and to get them interacting with our application's community. Users will be given full access to our application's features after they complete this journey.

## Creating the Goal
First we invoke an HTTP POST to create the goal. We use the **Goals** API as follows:

```jsonc
// HTTP POST https://<host>/api/v1/goals

// Request Body
{
  "name": "New Guy in Town",
  "description": "An introductory tutorial to teach new users how to use the application",
  "criteria": [
    {
      "description": "Log into the application once.",
  	  "targetEntityIdField": "userId",
      "qualifyingEvent": {
        "eventType": "logged-in"
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 1
    }, 
    {
      "description": "Accept the application's EULA (terms and agreements)",
  	  "targetEntityIdField": "userId",
      "qualifyingEvent": {
        "eventType": "eula-accepted"
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 1
    },
    {
      "description": "Introduce yourself in the forum",
  	  "targetEntityIdField": "userId",
      "qualifyingEvent": {
        "eventType": "posted-in-forum",
        "forum-id": "introductions"
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 1
    }
  ]
}

// Response Body
{
    "status": "ok",
    "goalId": "7b0e67b8-2e05-4f4b-b366-4eb94213f527"
}
```

You can read this goal as *A journey that is completed after jz-gamification-engine receives a login event, a eula-accepted event, and a introduction posted event for a given userId*.

## Reporting Activity
Next, as users log into our application, we invoke an HTTP POST against the jz-gamification-engine **Activities** API.

> The platform will eventually support integration with event brokers like Kafka so that clients do not have to send requests directly to the engine.

```jsonc
// HTTP POST https://<host>/api/v1/activities

// Request Body
{
  "clientId": "client-app-1234",
  "eventType": "logged-in",
  "platform": "mobile-app",
  "userId": "john-doe-1234",
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}
```

You can read this activity as "John Doe logged in using the mobile app". This activity satisfies the first `criteria.[].qualifyingEvent` entry defined in our *New Guy in Town* goal; consequently, John Doe has now made progress towards achieving this goal.

Note that *jz-gamification-engine* only processes key/value combinations that exist in configured goals. This is done to optimize activity processing. In this example, the other activity fields (`clientId`, `platform`, and `foo`) are simply ignored by the engine.

## Checking Progress
Let's invoke an HTTP GET against the **Goal Progress API** to see how close John Doe is to achieving this goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress/7b0e67b8-2e05-4f4b-b366-4eb94213f527

// Response Body
{
    "name": "New Guy in Town",
    "id": "7b0e67b8-2e05-4f4b-b366-4eb94213f527",
    "isComplete": false,
    "criteriaProgress": [
        {
            "description": "Introduce yourself in the forum",
            "progress": 0,
            "threshold": 1,
            "id": "864e5550-df1e-4eb8-a00e-192a6b6e8318"
        },
        {
            "description": "Log into the application once.",
            "progress": 1,
            "threshold": 1,
            "id": "4d85f6bd-c959-4b22-a413-1f0fdfb5ac92"
        },
        {
            "description": "Accept the application's EULA (terms and agreements)",
            "progress": 0,
            "threshold": 1,
            "id": "add0a7b6-4a9a-4889-a8de-cdf0e09f4c50"
        }
    ]
}
```

## Finishing the Goal

John has not yet completed all goal criteria - he still needs to accept the EULA and post in the forum. Let's simulate those events:
```jsonc
// HTTP POST https://<host>/api/v1/activities

// Request Body
{
  "clientId": "client-app-1234",
  "eventType": "eula-accepted",
  "userId": "john-doe-1234",
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}

// Request Body
{
  "clientId": "client-app-1234",
  "eventType": "posted-in-forum",  
  "forum-id": "introductions",
  "userId": "john-doe-1234",
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}
```

Upon checking the **Goal Progress API** again we see that John Doe has completed the journey:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress/7b0e67b8-2e05-4f4b-b366-4eb94213f527

// Response Body
{
    "name": "New Guy in Town",
    "id": "7b0e67b8-2e05-4f4b-b366-4eb94213f527",
    "isComplete": true,
    "completionTimestamp": 1650111754120,
    "criteriaProgress": [
        {
            "description": "Introduce yourself in the forum",
            "progress": 1,
            "threshold": 1,
            "id": "864e5550-df1e-4eb8-a00e-192a6b6e8318"
        },
        {
            "description": "Log into the application once.",
            "progress": 1,
            "threshold": 1,
            "id": "4d85f6bd-c959-4b22-a413-1f0fdfb5ac92"
        },
        {
            "description": "Accept the application's EULA (terms and agreements)",
            "progress": 1,
            "threshold": 1,
            "id": "add0a7b6-4a9a-4889-a8de-cdf0e09f4c50"
        }
    ]
}
```