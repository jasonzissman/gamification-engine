function log(message) {
    console.log(JSON.stringify({ time: new Date(), message }));
}
export { log };
