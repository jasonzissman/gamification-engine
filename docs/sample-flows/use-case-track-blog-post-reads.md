
# Best Selling Author 
Let's walk through the creation and usage of a "Best Selling Author" badge. This badge will be awarded to authors whose blog articles are read 1000 times in aggregate. We'll craft the goal so that progress is counted any time any user reads any article from this author.

## Creating the Goal
First we invoke an HTTP POST to create the goal. We use the **Goals** API as follows:

```jsonc
// HTTP POST https://<host>/api/v1/goals

// Request Body
{
  "name": "Best Selling Author",
  "description": "Awarded to users whoses blog content are viewed 1000+ times.",
  "criteria": [
    {
      "description": "Have your blog posts viewed 1000+ times",
  	  "targetEntityIdField": "authorId",
      "qualifyingEvent": {
        "eventType": "blog-post-viewed",
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

You can read this goal as *A goal that is completed after jz-gamification-engine receives 1000 events with `eventType=blog-post-viewed` and for a given `authorId`*.

Notice this goal does not specify *which* blog post had to be read. It only specifies that the targetEntityId is the `authorId`. This means any blog that any author writes counts towards that author's completion of the goal.

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
  "blogId": "blog-abc",
  "userId": "john-doe-1234",
  "authorId": "mark-twain-1234",
  "foo": "bar"
}

// Response Body
{
    "status": "received"
}
```

You can read this activity as "John Doe viewed blog post ABC which is authored by Mark Tawin". This activity matches the `criteria.[].qualifyingEvent` and `criteria.[].targetEntityIdField` fields defined in our *Best Selling Author* goal; consequently, Mark Twain has now made progress towards achieving this goal.

Note that *jz-gamification-engine* only processes key/value combinations that exist in configured goals. This is done to optimize activity processing. In this example, the other activity fields (`clientId`, `platform`, `blogId`, `userId` and `foo`) are simply ignored by the engine.

## Checking Progress
Let's invoke an HTTP GET against the **Goal Progress API** to see how close Mark Twain is to achieving this goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/mark-twain-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Best Selling Author",
    "isComplete": false,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Have your blog posts viewed 1000+ times",
            "progress": 1,
            "threshold": 1000,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}
```

Mark has not yet completed the required criteria to satisfy this goal since his blog post has only been viewed one time. After his blog posts are viewed a few more times, we would see that he has completed the Best Selling Author goal:

**Request**
```jsonc
// HTTP GET https://<host>/api/v1/entities/mark-twain-1234/progress/fb1e71f7-2cc2-4194-b69c-919f8039afcb

// Response Body
{
    "name": "Best Selling Author",
    "isComplete": true,
    "completionTimestamp": 1650022019914,
    "id": "fb1e71f7-2cc2-4194-b69c-919f8039afcb",
    "criteriaProgress": [
        {
            "description": "Have your blog posts viewed 1000+ times",
            "progress": 1304,
            "threshold": 1000,
            "id": "9fa51a7d-7356-46c6-aec1-02d6b74bdd76"
        }
    ]
}
```