const path = require('path');

module.exports = {
    name(__filename) {
        return path.basename(__filename, path.extname(__filename));
    }
};
