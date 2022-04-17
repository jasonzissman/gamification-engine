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

## TODO!!!!
* Allow enable/disable of goals
* Support nested event properties
* Perf test: create baseline that reliably executes in given environment (ram/CPU/etc).
* Perf test: make tests deterministic!
* Push notifications when goal completed.
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Cache calls to database
* General authorization approach.
* Put in timing/profiling options to warn if things are going too slow
* Cache common/repeated calls
* support mutli-node or clustered model (broadcast to clients when known attributes change)
* use Jest instead of Mocha
