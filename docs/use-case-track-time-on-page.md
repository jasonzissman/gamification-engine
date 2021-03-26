
# Bookworm - A badge tied to time spent reading content
We'll create a "Bookworm" badge which will be awarded to users who spend at least 10 minutes reading website content. We'll also give 100 points to anyone who completes this badge.

## Creating the Badge
First we invoke an HTTP POST to create the badge. Use the `/goal` API as follows:

**Request**
```
// HTTP POST 
// https://<host>/goal
{
  "name": "Bookworm",
  "description": "Spend at least 10 minutes reading website content",
  "targetEntityIdField": "userId",
  "points": 100,
  "criteria": [
    {
      "qualifyingEvent": {
        "action": "read-website-content"
      },
      "aggregation": {
      	"type": "sum",
        "valueField": "timeSpentInSeconds"
      },
      "threshold": 600 
    }
  ]
}
```

You can read this goal as *A badge that is completed for a given `userId` after the gamification system totals a `timeSpentInSeconds` value of 1200 or greater from events with `action=read-website-content`, `timeSpentInSeconds=<some_value>`, and `userId=<that-users-ids>`*.

## Sending Usage Events
Next, as users read the content of our application, we invoke an HTTP POST against the jz-gamification-engine `/event` API:

**Request**
```
// HTTP POST 
// https://<host>/event
{
  "action": "read-website-content",
  "timeSpentInSeconds": 500,
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

To track progress towards a goal, the events that we send must include enough information to match the `criteria.[].qualifyingEvent` and `targetEntityIdField` fields that were provided when creating your goal. In our case, our example event includes `action=read-website-content`, `timeSentInSeconds`, and `userId`, as our "Bookworm" goal requires.

However, in this case, user john-doe-1234 only read for 500 seconds, not the required 600 seconds. As such, he has not met the goal yet. We invoke the `/entity/<entityId>` API to see how John (or any user) is tracking towards the Bookworm badge.

**Request**
```
// HTTP GET 
// https://<host>/entity/john-doe-1234
```

**Response**
```
{
    entityId: 'john-doe-1234',
    points: 0,
    goals: {
        goal_12345678: {
            criteriaIds: {
                criteria_9999: {
                    isComplete: false,
                    value: 500
                }
            },
            isComplete: false
        }
    }
```

John has not yet completed the required criteria to satisfy this goal.

Let's pretend John comes back 2 weeks from now and reads some more content for 200 more seconds. We issue this HTTP POST against the jz-gamification-engine `/event` API:

**Request**
```
// HTTP POST 
// https://<host>/event
{
  "action": "read-website-content",
  "timeSpentInSeconds": 200,
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

Great! Now the events received by the jz-gamification-engine have indicated that John has read more than enough (700 seconds) to meet our goal requirements.

Finally, as needed, we invoke an HTTP GET against the `/entity/<entityId>` API to see how John (or any user) is tracking towards the Bookworm badge.

**Request**
```
// HTTP GET 
// https://<host>/entity/john-doe-1234
```

**Response**
```
{
    entityId: 'john-doe-1234',
    points: 100,
    goals: {
        goal_12345678: {
            criteriaIds: {
                criteria_9999: {
                    isComplete: true,
                    value: 700
                }
            },
            isComplete: true
        }
    }
```

We see in the response that John has completed all the criteria in the goal and has been awarded 100 points for his effort.