'use strict'

const AWS = require('aws-sdk')
const debug = require('debug')('tt:aws')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')

module.exports.init = function(config) {

    var s3 = new AWS.S3({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: config.region,
        bucket: config.bucket
    })

    var defaultTempPath = path.resolve(__dirname, '..', 'tmp')
    var uploadOptions = {
        uploadDirectory: config.uploadDirectory || '',
        tempDirectory: config.tempDirectory || defaultTempPath
    }

    function upload(key, bodyStream, options) {

        return saveToTempFile(bodyStream)
            .then((imagePath) => {

                let readStream = fs.createReadStream(imagePath)
                readStream
                    .on('error', (err) => {
                        debug('Error reading the temporary file before the upload to s3')
                        return Promise.reject(err)
                    })

                let params = {
                    ACL: 'public-read',
                    ContentType: options.contentType || 'image/jpeg',
                    Bucket: s3.config.bucket,
                    Key: `${uploadOptions.uploadDirectory}/${key}`,
                    Body: readStream
                }

                var cleanup = _ => deleteTempFile(imagePath)
                return uploadToS3(params)
                    .then(cleanup, cleanup)
                    .then(() => {
                        return { url: getS3ImageUrl(params.Key) }
                    })
            })
    }

    function saveToTempFile(bodyStream) {
        return new Promise((resolve, reject) => {
            var tempImageName = uuid.v4()

            var imagePath = path.join(uploadOptions.tempDirectory, tempImageName)
            var writeStream = fs.createWriteStream(imagePath)

            bodyStream.pipe(writeStream)
                .on('error', (err) => {
                    return reject(err)
                })

            bodyStream
                .on('end', () => {
                    return resolve(imagePath)
                })
        })
    }

    function uploadToS3 (params) {
        return new Promise((resolve, reject) => {
            s3.putObject(params, function (err, res) {

                if (err) {
                    debug('S3 upload failed', err.message, err.stack)
                    return reject(err)
                }

                debug('S3 responds to upload of ', res)
                return resolve(res)
            })
        })
    }

    function deleteTempFile(imagePath) {

        return new Promise((resolve, reject) => {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    return reject(err)
                }

                return resolve()
            })
        })
    }

    function getS3ImageUrl(filePath) {
        return s3.endpoint.href + s3.config.bucket + '/' + filePath
    }

    return {
        upload
    }

}