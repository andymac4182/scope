const awsSdk = require('aws-sdk')
const IssuesBucket = process.env.IssuesBucket
const DEBUG = process.env.DEBUG

module.exports = function tearDown(event, context, callback) {
  listAllObjects()
  deleteAllObjects()
}


const keysToDelete = []

function listAllObjects(continuationToken) {
  var params = {
    Bucket: IssuesBucket,
    MaxKeys: 1000,
  }

  if (typeof(continuationToken) !== 'undefined') {
    params.ContinuationToken = continuationToken
  }

  s3.listObjectsV2(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      return
    }
    const newKeys = data.Contents.map(k => k.Key)
    Array.prototype.push.apply(keysToDelete, newKeys);
    if (data.IsTruncated) {
      listAllObjects(data.NextContinuationToken)
    }
  });
}

function deleteAllObjects() {
  const batchesToDelete = chunk(keysToDelete, 999)
  batchesToDelete.map(k => deleteObjects(k))
}

function deleteObjects(keys) {
  var params = {
    Bucket: IssuesBucket,
    Delete: {
      Objects: [keys.map(k => { Key: k })],
      Quiet: true
    },
    MFA: 'STRING_VALUE',
    RequestPayer: 'requester'
  };
  s3.deleteObjects(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function chunk(array, size) {
  var results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
}