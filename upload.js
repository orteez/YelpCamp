const AWS = require("aws-sdk");
const fs = require('fs')
const Campground = require('./models/campground');

require('dotenv').config();

console.log(process.env.AWS_KEY)

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
});


const uploadFile = async (userid, file) => {
    // Setting up S3 upload parameters
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${userid}/${file.originalname || "photo"}`,
        Body: fs.createReadStream(file.path)
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
        if (err) {
            console.log(err)
            url = null
        } else {
            console.log(userid)
            Campground.update({
                "_id": userid}, {
                $push: {
                    "photoUrls": data.Location
                }
            }, (err, camp) => {
                if(err) {
                    console.log(err)
                } else {
                    console.log(data.Location)
                    console.log(camp)
                }
            })
        }
    });
};

module.exports = {
    uploadFile
}