const fs = require('fs');
const path = require('path');

module.exports = (() => {
    const files = {};
    const p = path.resolve(__dirname, './functions');
    // eslint-disable-next-line global-require,import/no-dynamic-require,no-return-assign
    fs.readdirSync(p).map((fn) => (files[fn.replace('.js', '')] = require(`${p}/${fn}`)));
    return files;
})();
