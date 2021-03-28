# jz-gamification-engine APIs

## Vocabulary

* `goals` are as you understand it in English - objectives that someone can achieve.
* `criteria` are the specific conditions which entities must satisfy to achieve a goal. 
* `entities` are the things that can achieve goals. Most often entities are your application's users.

**Events** are the basic currency of the engine. We define criteria in terms of `qualifyingEvents` that specify which events should qualify towards goal completion. Events are then sent to the jz-gamification-engine as users interact with your system. The jz-gamification-engine will determine if progress towards a goal should be updated based on the event metadata.

Note that anything with a unique identifier can make progress towards a goal, not just users. This is why we use the words 'entity' instead of 'user' in our vocabulary.

## Create Goal

**Example Request**
```
// HTTP POST 
// https://<host>/goals
{
  "name": "Mobile Power User",
  "description": "Log in at least 5 times on a mobile device", //optional
  "points" 10, //optional
  "targetEntityIdField": "userId",
  "criteria": [
    {
      "qualifyingEvent": {
        "action": "log-in"
      },
      "aggregation": {
      	"type":"count",
        "value": 5, //optional, only relevant if type=sum
        "valueField: "someEventField" //optional, only relevant if type=sum
      },
      "threshold": 5
    }
  ]
}
```

**Example Response**
```
{ status: "ok", goal: <created_goal_with_id> }
```

* `name`: (required) a human readable name for the goal.
* `description`: (optional) a human readable description for the goal.
* `points`: (optional) a numeric value that will be awarded to a user after completing the goal.
* `targetEntityIdField`: (required) the field on inbound events that identifies the entity who is making progress towards this goal.
* `criteria`: (required) an array of 1 or more requirements to complete this goal. The goal is only completed for an entity once all of this criteria are fulfilled.
* `criteria.[].qualifyingEvent`: (required) a JSON object describing the *bare minimum key/value pairs that must be present on an inbound event* for it to qualify towards a goal criteria. 
* `criteria.[].aggregation`: (required) a JSON object describing how to increment/count each received event towards goal completion progress.
* `criteria.[].aggregation.type`: (required) These are two values supported today -`count` and `sum`. 
    * A `count` aggregation simply increments goal progress by 1 for every received qualifying event.
    * A `sum` aggregation increments goal progress by a predefined value (`criteria.[].aggregation.value` or the value of the `criteria.[].aggregation.valueField` field on the received qualifying event).
* `criteria.[].aggregation.value`: (optional) If using a 'sum' aggregation, this value represents the quantity by which progress towards a goal will be incremented with each received qualifying event.
* `criteria.[].aggregation.valueField`: (optional) If using a 'sum' aggregation, this value represents *the field in the received event* which contains the quantity by which progress towards a goal will be incremented with each received qualifying event.

## Update Goal State

**Example Request**
```
// HTTP POST 
// https://<host>/goals/<goalId>/state
{
    state: "disabled"
}
```

**Example Response**
```
{
    status: "ok"
}
```

The `/goals/<goalID>/state` API allows you to disable or enable goals. Progress is not tracked towards disabled goals even if matching events are received. Goals are enabled by default upon creation. 

The only parameter in the POST payload is `state`, which must be equal to a value of either 'enabled' or 'disabled'.

## Send Event

**Example Request**
```
// HTTP POST 
// https://<host>/events[?waitForEventToFinishProcessing=false]
{
    "action": "log-in",
    "userId": "john-doe-1234"
}
```

**Example Response**
```
{ 
    status: "received",
    timingMs:, 10 //server-side ms taken to complete request
    completedUpdates: [] // array of updates applied, only if waitForEventToFinishProcessing=true
}
```

The `/events` API is very generic and **has no required fields**. It accepts any JSON payload.

For this endpoint to successfully track an entity's progress towards a goal, the event payload should include data points that match the `criteria.[].qualifyingEvent` and `targetEntityIdField` fields that are defined in corresponding goals. 

When a received event *contains at least all of those key/value pairs*, progress is tracked towards that goal for the corresponding entityId. 

If a received event fails to match those required key/value pairs for a goal, progress is **not** tracked towards that goal.

After an event is referenced against all defined goals, it is discarded.

For preformance reasons, this endpoint immediately returns 200 upon receiving a request even before it has fully processed the event. You can add the optional query parameter `waitForEventToFinishProcessing=true` to indicate that an http response should only be received after all processing has finished.

If possible, only include data in your /events requests that are relevant to goal completion. jz-gamification-engine will gracefully discard irrelevant data, but excessive amounts of irrelevant data will degrade performance.

## Get Entity Progress Towards Goals

**Example Request**
```
// HTTP GET 
// https://<host>/entities/john-doe-1234
```

**Example Response**
```
{
    entityId: 'john-doe-1234',
    points: 35,
    goals: {
        goal_12345678: {
            criteriaIds: {
                criteria_9999: {
                    isComplete: true,
                    value: 1
                }
            },
            isComplete: true
        }
    }
```

This will return a breakdown of an entity's progress towards all goals, as well as total points accumlated by that entity. Note that this API will return empty/missing values if no progress has been made towards a specific goal or goal criteria.

## Update Entity Points

**Example Request**
```
// HTTP POST 
// https://<host>/entities/<entityId>/points
{
    amount: -5
}
```

**Example Response**
```
{
    entityId: 'john-doe-1234',
    points: 30, // was 35 before
    goals: {}
```

The `/entities/<entityId>/points` API allows you to increment or decrement the points that an entity has accumlated. This can be leveraged when implementing 'stores' and other systems that rely on the user accuring points over time. 

The only parameter in the POST payload is `amount`, which is a numeric value by which the tracked points will change. Note that it can be positive or negative.

