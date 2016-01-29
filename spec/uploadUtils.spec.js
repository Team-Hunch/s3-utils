'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)
var expect = chai.expect

const fs = require('fs')
const uuid = require('uuid')
const AWS = require('aws-sdk')

const MockStream = require('./mockStream')
const uploadUtils = require('../lib/uploadUtils')

describe('Upload utils', () => {

    var fsCreateReadStreamStub, fsCreateWriteStreamStub, fsUnlinkStub, s3PutObjectStub, uuidV4Stub

    beforeEach(() => {

        fsCreateReadStreamStub = sinon.stub(fs, 'createReadStream', () => new MockStream.MockReadableStream)
        fsCreateWriteStreamStub = sinon.stub(fs, 'createWriteStream', () => new MockStream.MockWritableStream)
        fsUnlinkStub = sinon.stub(fs, 'unlink', (imagePath, callback) => { callback() })
        uuidV4Stub = sinon.stub(uuid, 'v4', () => 'tempName')

        s3PutObjectStub = sinon.stub(AWS.S3.prototype, 'makeRequest', (op, params, callback) => {

            if (typeof params === 'function') {
                callback = params;
                params = null;
            }

            callback()
        })

        sinon.stub(AWS.S3.prototype, 'setEndpoint', function (endpoint) {
            this.endpoint = new AWS.Endpoint("s3.amazonaws.com")
        })
    })

    afterEach(() => {

    })

    it('save file, upload to s3 and delete the temp file', (done) => {

        let config = {
            uploadDirectory: 'uploadLocation',
            tempDirectory: 'c:/tempLocation/',
            bucket: 'stubBucket'
        }

        let expectedTempFilePath = `${config.tempDirectory}tempName`
        let expectedUploadPath = `${config.uploadDirectory}/foo`

        uploadUtils(config).upload('foo', new MockStream.MockReadableStream, { contentType: 'stubContentType' })
            .then((result) => {
                expect(fsCreateWriteStreamStub).to.have.been.calledOnce
                expect(fsCreateWriteStreamStub).to.have.been.calledWith(expectedTempFilePath)

                expect(fsCreateReadStreamStub).to.have.been.calledOnce
                expect(fsCreateReadStreamStub).to.have.been.calledWith(expectedTempFilePath)

                expect(s3PutObjectStub).to.have.been.calledWith('putObject', sinon.match((params) => {
                    return params.ContentType == 'stubContentType'
                    && params.Bucket == 'stubBucket'
                    && params.Key == expectedUploadPath
                }))

                expect(fsUnlinkStub).to.have.been.calledWith(expectedTempFilePath)

                expect(result.url).to.equal('https://s3.amazonaws.com/stubBucket/uploadLocation/foo')

                done()
            })
            .catch(err => done(err))
    })
})