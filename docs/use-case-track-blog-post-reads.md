
# Best Selling Author 
Let's walk through the creation and usage of a "Best Selling Author" badge. This badge will be awarded to users whose blog articles are read 1000 times in aggregate. We'll craft the goal so that progress is counted any time any user reads any article from this author.

## Creating the Badge
First we invoke an HTTP POST to create the badge. Use the `/goal` API as follows:

```
// HTTP POST 
// https://<host>/goal
{
  "name": "Best Selling Author",
  "description": "Be the author whose blog posts are read at least 1000 times.",
  "points": 500,
  "targetEntityIdField": "blogAuthorId", 
  "criteria": [
    {
      "qualifyingEvent": {
        "action": "view-blog-post",
      },
      "aggregation": {
      	"type":"count"
      },
      "threshold": 1000
    }
  ]
}
```

You can read this goal as *A badge that is completed for a given `blogAuthorId` after the gamification system receives 1000 events with `action=view-blog-post` and `blogAuthorId=*`*.

## Sending Usage Events
Next, as users view any blog post, we invoke an HTTP POST against the jz-gamification-engine `/event` API:

**Request**
```
// HTTP POST 
// https://<host>/event
{
  "action": "view-blog-post",
  "blogAuthorId": "mark-twain-1234",
  "blogArticleId": 246536, // there can be extra data, it will just be ignored for this goal
  "userId": "john-doe-1234" // there can be extra data, it will just be ignored for this goal
}
```

To track progress towards a goal, the events that we send must include enough information to match the `criteria.[].qualifyingEvent` and `targetEntityIdField` fields that were provided when creating your goal. In our case, our example event includes `action=view-blog-post` and `blogAuthorId`, as our "Best Selling Author" goal requires. 

We see that author mark-twain-1234 has made some initial progress towards the goal. We invoke an HTTP GET against the `/entity/<entityId>` API to see how far he has gotten:

**Request**
```
// HTTP GET 
// https://<host>/entity/mark-twain-1234
```

**Response**
```
{
    entityId: 'mark-twain-1234',
    points: 0,
    goals: {
        goal_12345678: {
            criteriaIds: {
                criteria_9999: {
                    isComplete: false,
                    value: 1
                }
            },
            isComplete: false
        }
    }
```

Mark Twain has not yet completed the required criteria to satisfy this goal. Only one event that meets the criteria has been processed so far, but the goal requires 1000 such events. 

Let's say throughout the week we see a lot more traffic on Mark Twain's blog post with 2400 people viewing different posts of his:

**Request (x2400)**
```
// HTTP POST (2400)
// https://<host>/event
{
  "action": "view-blog-post",
  "blogAuthorId": "mark-twain-1234",
  "blogArticleId": 245245, // there can be extra data, it will just be ignored for this goal
  "userId": "john-doe-1234" // there can be extra data, it will just be ignored for this goal
}
```

We check Mark Twain's progress one more time and see that he has now completed the goal requirements:

**Request**
```
// HTTP GET 
// https://<host>/entity/mark-twain-1234
```

**Response**
```
{
    entityId: 'mark-twain-1234',
    points: 10,
    goals: {
        goal_12345678: {
            criteriaIds: {
                criteria_9999: {
                    isComplete: true,
                    value: 2401
                }
            },
            isComplete: true
        }
    }
```