const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

exports.parse = (fileName) => {
    const fileText = fs.readFileSync(fileName, 'utf8');

    const ext = path.extname(fileName);
    let ret = null;
    if (ext === 'yml' || ext === 'yaml')  {
        ret = YAML.parse(fileText);
    }
    else {
        ret = JSON.parse(fileText);
    }

    return ret;
}