# JZ Gamification Engine

![Trophy logo](./logo.png)

jz-gamification-engine is a platform that facilitates powerful gamification features for your application in a decoupled, performant fashion. 

## Why Gamification?

Gamification can facilitate many positive outcomes for your application:

- Incentivize your users to engage more with your application by rewarding them for performing desired behaviors
- Help you identify your website's best users and content by measuring engagement milestones 
- Ensure your new users engage with your platform correctly by tracking their completion of onboarding actions

See [common use cases](./docs/use-cases/overview.md) for in-depth examples on how facilitate these features with jz-gamification-engine.

## Why a Dedicated Engine?

Gamification flows are often coupled tightly with the business logic of an application. They are difficult to extend and scale in a reusable fashion. jz-gamification-engine attempts to isolate the fundamental gamification flows (define goals, make progress towards goals, check goal progress, etc.) so they can be scaled independently and reused effectively.

## Getting Started
Today the engine is most easily run via docker compose. A more mature deployment system should become available at a later date.

```bash
## You can modify memory settings and ports in `docker-compose.yaml`
docker compose up
```

The API documentation will be available at `http://localhost:3000/api/v1/docs/` after startup. The APIs enable all of the engine's features via three basic operations:

1. Creating `goals` relevant to your application with the **Goals API**.
2. Send usage `activity` as users interact with your application with the **Activities API**.
3. Check on an `entity's` progress towards goals **Goal Progress API**.

See the [common use cases](./docs/use-cases/overview.md) for examples on how to create and use goals.

## Feature Ideas that Need Prioritization
* Support nested (dot notation) activity field names
* Event stream integration
* Allow enabling/disabling of goals
* Allow expiration of goals
* Push notifications when entity completes goal
* Authorization
* Put in timing/profiling options to warn if things are going too slow
* support mutli-node or clustered model (broadcast to clients when known attributes change)
* use Jest instead of Mocha
