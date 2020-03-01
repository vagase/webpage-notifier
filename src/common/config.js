const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

function parse(fileName) {
    const fileText = fs.readFileSync(fileName, 'utf8');

    const ext = path.extname(fileName);
    let ret = null;
    if (ext === '.yml' || ext === '.yaml')  {
        ret = YAML.parse(fileText);
    }
    else {
        ret = JSON.parse(fileText);
    }

    return ret;
}

let configCache = null;
exports.resolve = (keyPath) => {
    if (!configCache) {
        const filePath = path.join(__dirname, '../../config/default.yaml');
        configCache = parse(filePath);
    }

    return keyPath.split('.').reduce((previous, current) => previous[current], configCache);
};

exports.parse = parse;