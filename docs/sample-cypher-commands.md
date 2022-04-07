# Sample Cypher Commands 

These Cypher scripts create and query sample goals, criteria, and attributes.

```cypher

// Delete everything and start over
MATCH (n) DETACH DELETE n

// Create sample goals, criteria, attributes, and relate them together

CREATE (g1:Goal { 
    id: '1',
    name: "Log in 5 times",
    state: "enabled",
    description: "Award 100 points when a user logs into the application 5 times.",
    points: 100
})

CREATE (c1:Criteria { 
    id: "1",
    targetEntityIdField: "userId",
    aggregation_type: "count",
    threshold: 5
})



CREATE (e1:EventAttribute { expression: "action=log_in"})

CREATE (g1)-[:HAS_CRITERIA]->(c1)
CREATE (c1)-[:REQUIRES_EVENT_ATTRIBUTE]->(e1)

CREATE (g2:Goal { 
    id: '2',
    name: "Log in on a mobile device 5 times",
    state: "enabled",
    description: "Award 1000 points when a user logs into the application 5 times from a mobile device.",
    points: 100
})

CREATE (c2:Criteria { 
    id: "2",
    targetEntityIdField: "userId",
    aggregation_type: "count",
    threshold: 5
})

CREATE (e2:EventAttribute { expression: "device=mobile"})

CREATE (g2)-[:HAS_CRITERIA]->(c2)
CREATE (c2)-[:REQUIRES_EVENT_ATTRIBUTE]->(e1)
CREATE (c2)-[:REQUIRES_EVENT_ATTRIBUTE]->(e2)

CREATE (g3:Goal { 
    id: '3',
    name: "View Page ABC",
    state: "enabled",
    description: "Award 10 points when a user views page ABC.",
    points: 100
})

CREATE (c3:Criteria { 
    id: "3",
    targetEntityIdField: "userId",
    aggregation_type: "count",
    threshold: 1
})

CREATE (e3:EventAttribute { expression: "action=view_page"})
CREATE (e4:EventAttribute { expression: "page_id=123"})

CREATE (g3)-[:HAS_CRITERIA]->(c3)
CREATE (c3)-[:REQUIRES_EVENT_ATTRIBUTE]->(e3)
CREATE (c3)-[:REQUIRES_EVENT_ATTRIBUTE]->(e4)

//////

CREATE (g4:Goal {
    id: '4',
    name: "Read 30 Minutes' Worth of Content",
    state: "enabled",
    description: "Award 100 points when a reads blog entries for 30 minutes.",
    points: 100
})

CREATE (c4:Criteria { 
    id: "4",
    targetEntityIdField: "userId",
    aggregation_type: "sum",
    aggregation_value_field: "minutes_read",
    threshold: 30
})

CREATE (e5:EventAttribute { expression: "action=view_page"})

CREATE (g4)-[:HAS_CRITERIA]->(c4)
CREATE (c4)-[:REQUIRES_EVENT_ATTRIBUTE]->(e5)


///////////



// Create user entities that are making progress towards goals

MATCH (c:Criteria {id:"1"})
MERGE (e:Entity {
  id: "456"
})
MERGE (e)-[r:HAS_MADE_PROGRESS]-> (c)
ON CREATE set r.value = 1
ON MATCH SET r.value = r.value+1
RETURN r.value

// Find criteria fully satisfied by "logged in on desktop" received payload
WITH
  ["action=log_in","device=desktop", "foo=bar"] as receivedEventProps
MATCH
  (c:Criteria)-[:REQUIRES_EVENT_ATTRIBUTE]->(e:EventAttribute)
WHERE
  ALL(candidateAttribute IN [(c)-[:REQUIRES_EVENT_ATTRIBUTE]->(candidateAttributes:EventAttribute) | candidateAttributes] WHERE candidateAttribute.expression IN receivedEventProps)
RETURN
  c

// Find events fully satisfied by "logged in on mobile" received payload
WITH
  ["action=log_in","device=mobile","foo=bar"] as receivedEventProps
MATCH
  (c:Criteria)-[:REQUIRES_EVENT_ATTRIBUTE]->(e:EventAttribute)
WHERE
  ALL(candidateAttribute IN [(c)-[:REQUIRES_EVENT_ATTRIBUTE]->(candidateAttributes:EventAttribute) | candidateAttributes] WHERE candidateAttribute.expression IN receivedEventProps)
RETURN
  c

// Find events fully satisfied by "viewed page 789" received payload
WITH
  ["action=view_page","page_id=789","device=mobile","foo=bar"] as receivedEventProps
MATCH
  (c:Criteria)-[:REQUIRES_EVENT_ATTRIBUTE]->(e:EventAttribute)
WHERE
  ALL(candidateAttribute IN [(c)-[:REQUIRES_EVENT_ATTRIBUTE]->(candidateAttributes:EventAttribute) | candidateAttributes] WHERE candidateAttribute.expression IN receivedEventProps
RETURN
  c
  ```