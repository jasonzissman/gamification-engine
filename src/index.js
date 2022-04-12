import { startServer } from './server.js';

const serverPort = 3000;
const neo4jBoltUri = process.env.NEO4J_BOLT_URI;
const neo4jUser =  process.env.NEO4J_USER;
const neo4jPassword =  process.env.NEO4J_PW;

startServer(serverPort, neo4jBoltUri, neo4jUser, neo4jPassword);