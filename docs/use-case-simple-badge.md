
# Mobile Power User - a simple badge
Let's walk through the creation and usage of a simple "Mobile Power User" badge. This badge will be awarded to users who log into our mobile app at least 5 times. Anyone who completes the badge will be awarded 10 points.

## Creating the Badge
First we invoke an HTTP POST to create the badge. Use the `/goals` API as follows:

```
// HTTP POST 
// https://<host>/goals
{
  "name": "Mobile Power User",
  "description": "Log in at least 5 times on a mobile device",
  "points": 10,
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

## Sending Usage Events
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

To track progress towards a goal, the events that we send must include enough information to match the `criteria.[].qualifyingEvent` and `targetEntityIdField` fields that were provided when creating your goal. In our case, our example event includes `action=log-in`, `platform=mobile`, and `userId`, as our "Mobile Power User" goal requires. 

We see that user john-doe-1234 has made some initial progress towards the goal. We invoke an HTTP GET against the `/entities/<entityId>` API to see how far he has gotten:

**Request**
```
// HTTP GET 
// https://<host>/entities/john-doe-1234
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
                    value: 1
                }
            },
            isComplete: false
        }
    }
```

John has not yet completed the required criteria to satisfy this goal. He has only logged one event that meets the criteria, but the goal requires 5 such events. 

Let's say John logs in again tomorrow but on his desktop instead of the mobile app. We receive an event like this:

**Request**
```
// HTTP POST 
// https://<host>/events
{
  "action": "log-in",
  "platform": "desktop",
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

This event would **not** contribute towards John completing the goal since it does not contain the requires `platform=mobile` attribute. Ultimately, this event will be discarded as it does not apply towards any system goals.

But, later that day, John logs into the mobile app 4 more times:

**Request (x4)**
```
// HTTP POST (x4)
// https://<host>/events
{
  "action": "log-in",
  "platform": "mobile",
  "userId": "john-doe-1234",
  "foo": "bar" // there can be extra data, it will just be ignored
}
```

We check John's progress one more time and see that he has now completed the goal requirements:

**Request**
```
// HTTP GET 
// https://<host>/entities/john-doe-1234
```

**Response**
```
{
    entityId: 'john-doe-1234',
    points: 10,
    goals: {
        goal_12345678: {
            criteriaIds: {
                criteria_9999: {
                    isComplete: true,
                    value: 5
                }
            },
            isComplete: true
        }
    }
```