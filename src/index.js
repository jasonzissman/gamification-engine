import { startServer } from './server.js';

const serverPort = 3000;
const neo4jBoltUri = process.env.NEO4J_BOLT_URI || `bolt://localhost:7687/`;
const neo4jUser =  process.env.NEO4J_USER || `neo4j`;
const neo4jPassword =  process.env.NEO4J_PW || `neo4j`;

startServer(serverPort, neo4jBoltUri, neo4jUser, neo4jPassword);