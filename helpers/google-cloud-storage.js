
const Cloud = require('@google-cloud/storage');
const path = require('path');

const servicekey = path.join(__dirname,'../config/cs583-final-project-acc4732a8f69.json');

const { Storage } = Cloud;

const storage = new Storage({
    keyFilename: servicekey,
    projectId : "cs583-final-project"
})


module.exports = storage;