
const util = require('util');
const gc = require('../helpers/google-cloud-storage');
const bucket = gc.bucket('cs385-final-project');

const { format } = util;


const uploadImage = (file)=>new Promise((resolve, rejects)=>{
    const { originalname, buffer} = file;

    //console.log(originalname)

    const blob = bucket.file(originalname.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    blobStream.on('finish',()=>{
        const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
           // 'https://storage.googleapis.com/cs385-final-project/Corn-800x416.jpg'
        )
        resolve(publicUrl)
    })
    .on('error', ()=>{
        rejects(`Unable to upload image, something went wrong`)
    })
    .end(buffer);
})

module.exports = uploadImage;