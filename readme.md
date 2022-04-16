# JZ Gamification Engine
*jz-gamification-engine* is a platform that facilitates common gamification features. It is a backend service meant to run alongside existing applications that want to offer gamification features in a decoupled, performant fashion. 

*jz-gamification-engine* currently supports:

- Custom goal definition (e.g. badges or user journeys)
- Goal progress tracking

These features can be used to enable gamification flows such as:

- Awarding a badge to **blog posts** that are read 1000+ times. 
- Awarding a badge to **blog post authors** whose content are read 1000+ times. 
- Requiring **new users** to complete a journey that involves visiting 3 tutorial pages and writing a first blog post before gaining access to greater functionality.

See the [documented sample flows](./docs/sample-flows/) to learn how to facilitate these features.

## Getting Started
Today the engine is most easily run via docker compose. A more mature deployment system should become available at a later date.

```bash
## You can modify memory settings and ports in `docker-compose.yaml`
docker compose up
```

The API documentation will be available at `http://localhost:3000/api/v1/docs/` after startup. The APIs enable all of the engine's features via three basic operations:

1. Creating `goals` relevant to your application with the **Goals API**.
2. Send usage `activity` as users interact with your applcation with the **Activities API**.
3. Check on an `entity's` progress towards goals **Goal Progress API**.

See the [documented sample flows](./docs/sample-flows/) for examples on how to interact with the APIs.

## TODO!!!!
* Allow enable/disable of goals
* Support nested event properties
* Allow assignment of goals
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
