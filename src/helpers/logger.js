function info(message) {
    console.log(`${new Date()}::: ${message}`);
}
function error(message) {
    info(message);
}
module.exports = { info, error };
