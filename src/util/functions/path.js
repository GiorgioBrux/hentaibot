import path from 'path';

function name(__filename) {
    return path.basename(__filename, path.extname(__filename));
}

export default { name };
