require = require("esm")(module/*, options*/);
console.time('playing-interaction-services import');
module.exports = require('./src/index').default;
module.exports.DocTypes = require('./src/constants').DocTypes;
module.exports.entities = require('./src/entities').default;
module.exports.models = require('./src/models').default;
console.timeEnd('playing-interaction-services import');
