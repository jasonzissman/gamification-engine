# JZ Gamification Engine
*jz-gamification-engine* is a platform that manages common gamification features such as badges, user journeys, and point systems. 

## Features and Flows
The gamification engine is a backend service meant to run alongside existing applications that want to offer gamification features in a decoupled, performant fashion. It currently supports:

- Custom goal definition (e.g. badges or user journeys)
- Goal progress tracking
- Real time goal completion notifications
- The ability for "non-user" entities to make progress towards goals
- Integration with event brokers like Kafka

These features can be used to enable gamification flows such as:

- Awarding a badge to **blog posts** that are read 1000+ times. 
- Awarding a badge to **blog post authors** whose content are read 1000+ times. 
- Requiring new users to complete a journey that involves visiting 3 tutorial pages and writing a first blog post before gaining access to greater functionality.
- Awarding a badge to users that log in using a mobile app 5 times.  

See the [documented sample flows](./docs/sample-flows/) to learn how to facilitate these features.

## Getting Started
> As of April 2022, this project is very young. I welcome feedback and suggestions, but keep in mind that this platform is not battle tested.

See the [getting started guide](./docs/getting-started.md) to learn how to deploy the engine and start interacting with it.

### Detailed APIs
[Swagger APIs](TODO_PUT_THIS_HERE)

### System Architecture and Design
[Detailed system architecture documentation](docs/system-architecture.md)

## Local Development

### Setup
```
npm install
```

### Running Unit Tests

```
npm run unit-tests
```

### Running Integration Tests

```
npm run integration-tests
```

### Running the app (Node)
```
npm start
```


## TODO!!!!
* Define API schema, generate swagger from it
* Can we make this Docker friendly?
* Perf test: create baseline that reliably executes in given environment (ram/CPU/etc).
* Perf test: make tests deterministic!
* Swagger
* Push notifications when goal completed.
* Add support for goal expiration! Should not process criteria/goals that are no longer applicable.
* Cache calls to database
* General authorization approach.
* Put in timing/profiling options to warn if things are going too slow
- Establish perf test baseline
- Cache common/repeated calls
- Dockerize neo4j
- Update API docs
- support mutli-node or clustered model (broadcast to clients when known attributes change)
- use Jest instead of Mocha
