# s3-utils [![Build Status](http://drone.ertrzyiks.me/api/badges/team-hunch/s3-utils/status.svg)](http://drone.ertrzyiks.me/team-hunch/s3-utils)

A utility for uploading images to s3.

## Prerequisites

- Node v5.x.x

## Usage

The s3-utils initializer expects the following values to be provided via the `config` parameter:
- `accessKeyId`
- `secretAccessKey`
- `region` - AWS region
- `bucket` - s3 bucket name
- `uploadDirectory` - the directory in s3 to put the file into
- `tempDirectory` - the directory where the uploaded file will be saved before uploading to s3. The file will be deleted from the location afterwards.


### Upload image to s3

`upload(key, bodyStream, options)`

- `key` - file name
- `bodyStream` - a readable stream of the file's content
- `options` - an object with a `contentType` field

The response is a JSON object containing the url of the uploaded image, e.g.:

```
{
    url: "https://s3.eu-central-1.amazonaws.com/newsshot/this-or-this/image.jpeg"
}
```
