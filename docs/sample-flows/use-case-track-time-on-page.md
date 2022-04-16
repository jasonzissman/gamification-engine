# Bookworm - A badge tied to time spent reading content
We'll create a "Bookworm" badge which will be awarded to users who spend at least 10 minutes reading website content. 

## Creating the Goal
First we invoke an HTTP POST to create the goal. We use the **Goals** API as follows:

```jsonc
// HTTP POST https://<host>/api/v1/goals

// Request Body
{
  "name": "Bookworm",
  "description": "Spend at least 10 minutes reading website content",
  "criteria": [
    {
      "description": "Spend time reading website content",
      "targetEntityIdField": "userId",
      "qualifyingEvent": {
        "action": "content-viewed"
      },
      "aggregation": {
      	"type": "sum",
        "valueField": "timeSpentInSeconds"
      },
      "threshold": 600 
    }
  ]
}

// Response Body
{
    "status": "ok",
    "goalId": "fb1e71f7-2cc2-4194-b69c-919f8039afcb"
}
```

You can read this goal as *A badge that is completed for a given `userId` after the gamification system totals a `timeSpentInSeconds` value of 600 or greater from events with `action=content-viewed`, `timeSpentInSeconds=<some_value>`, and `userId=<someUserId>`*.

## Reporting Activity
Next, as users view the our website's content, we invoke an HTTP POST against the jz-gamification-engine **Activities** API.

> The platform will eventually support integration with event brokers like Kafka so that clients do not have to send requests directly to the engine.

```jsonc
// HTTP POST https://<host>/api/v1/activities

// Request Body
{
  "clientId": "client-app-1234",
  "platform": "mobile-app",
  "action": "content-viewed",
  "page": "product-documentation-page",
  "userId": "john-doe-1234",
  "timeSpentInSeconds": 122,
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}
```

You can read this activity as "John Doe viewed the product documentation page for 122 seconds". This activity matches the `criteria.[].qualifyingEvent` and `criteria.[].targetEntityIdField` fields defined in our *Bookworm* goal; consequently, John Doe has now made progress towards achieving this goal.

Note that *jz-gamification-engine* only processes key/value combinations that exist in configured goals. This is done to optimize activity processing. In this example, the other activity fields (`clientId`, `platform`, `page`, `userId` and `foo`) are simply ignored by the engine.

## Checking Progress
Let's invoke an HTTP GET against the **Goal Progress API** to see how close John Doe is to achieving this goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Bookworm",
    "isComplete": false,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Spend time reading website content",
            "progress": 122,
            "threshold": 600,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
    
}
```

John has not yet completed the required criteria to satisfy this goal since he has only read roughly 2 minutes' worth of content. After he reads a while longer, we check in on his progress again.

**Request**

```jsonc
// HTTP GET https://<host>/api/v1/entities/john-doe-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
  "name": "Bookworm",
  "isComplete": true,
  "completionTimestamp": 1650022019914,    
  "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
  "criteriaProgress": [
      {
          "description": "Spend time reading website content",
          "progress": 122,
          "threshold": 600,
          "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
      }
  ]
}
```
