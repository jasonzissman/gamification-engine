
# Identifying Most Frequently Read Content to Surface Better Recommendations
Imagine you want to highlight popular articles on your website so that users can more easily find the highest quality content. To accomplish this we will create a "Best Selling Title" badge that will be awarded to **blog articles** that are read 1000 times on your platform. Articles that achieve this milestone will have a colorful badge displayed and will be promoted more heavily in searches.

## Creating the Goal
First we invoke an HTTP POST to create the goal. We use the **Goals** API as follows:

```jsonc
// HTTP POST https://<host>/api/v1/goals

// Request Body
{
  "name": "Best Selling Title",
  "description": "Awarded to blog posts which are viewed 1000+ times.",
  "criteria": [
    {
      "description": "Be viewed 1000+ times",
  	  "targetEntityIdField": "blogPostId",
      "qualifyingEvent": {
        "eventType": "blog-post-viewed"
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 1000
    }
  ]
}

// Response Body
{
    "status": "ok",
    "goalId": "fb1e71f7-2cc2-4194-b69c-919f8039afcb"
}
```

You can read this goal as *A goal that is completed after jz-gamification-engine receives 1000 events with `eventType=blog-post-viewed` for a given `blogPostId`*.

## Reporting Activity
Next, as users view the various blog posts within into our application, we invoke an HTTP POST against the jz-gamification-engine **Activities** API.

> The platform will eventually support integration with event brokers like Kafka so that clients do not have to send requests directly to the engine.

```jsonc
// HTTP POST https://<host>/api/v1/activities

// Request Body
{
  "clientId": "client-app-1234",
  "platform": "mobile-app",
  "eventType": "blog-post-viewed",
  "blogPostId": "blog-post-abc",
  "userId": "john-doe-1234",
  "authorId": "mark-twain-1234",
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}
```

You can read this activity as "John Doe viewed blog post ABC which is authored by Mark Twain". This activity matches the `criteria.[].qualifyingEvent` and `criteria.[].targetEntityIdField` fields defined in our *Best Selling Title* goal; consequently, Blog Post ABC has now made progress towards achieving this goal.

Note that jz-gamification-engine only processes key/value combinations that exist in configured goals. This is done to optimize activity processing. In this example, the other activity fields (`clientId`, `platform`, `userId`, `authorId` and `foo`) are simply ignored by the engine.

## Checking Progress Towards this Goal
Let's invoke an HTTP GET against the **Goal Progress API** to see how close this blog post is to achieving this goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/blog-post-abc/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Best Selling Title",
    "isComplete": false,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Be viewed 1000+ times",
            "progress": 1,
            "threshold": 1000,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}
```

This blog post has not yet completed the required criteria to satisfy the goal since it has only been viewed one time. After the post is viewed a few more times, we would see that he has completed the *Best Selling Title* goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/blog-post-abc/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Best Selling Title",
    "isComplete": true,
    "completionTimestamp": 1650022019914,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Be viewed 1000+ times",
            "progress": 1304,
            "threshold": 1000,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}
```

## Seeing All Goals Completed by an Entity
Your application will likely need to periodically check which goals an entity (user, blog post, or otherwise) has finished in order to enable special features or display badges correctly. For example - we want to display the *Best Selling Title* badge correctly the next time this blog post is viewed. The **Goal Progress API** will let you see all the goals that entities have completed so that you can enable functionality accordingly:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/blog-post-abc/progress?onlyComplete=true

// Response Body
[{
    "name": "Best Selling Title",
    "isComplete": true,
    "completionTimestamp": 1650022019914,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Be viewed 1000+ times",
            "progress": 1304,
            "threshold": 1000,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}]
```
