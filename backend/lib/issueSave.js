/**
 * Save github issue in S3
 */
const awsSdk = require('aws-sdk')
const IssuesBucket = process.env.IssuesBucket
const DEBUG = process.env.DEBUG

const s3 = new AWS.S3();

module.exports = function saveSingleIssue(issue, callback) {
  if (issue.state === 'closed' || issue.closed_at) {
    // add to closed database and remove from open issues
    saveClosedIssue(issue, callback)
  } else {
    // add to open database and remove from closed issues
    saveOpenIssue(issue, callback)
  }
}

function saveClosedIssue(issue, callback) {
  console.log('Issue or PR closed. Remove from DB')
  const deletedParams = {
    Bucket: IssuesBucket,
    Key: `open/${issue.number}`,
  }
  s3.deleteObject(deletedParams, function(err, deleteData) {
    if (err) return callback(err)
    if (DEBUG) {
      console.log(`issue ${issue.number} deleted from ${IssuesBucket} Bucket`, deleteData)
    }
    const putParams = {
      Bucket: IssuesBucket,
      Key: `closed/${issue.number}`,
      Body: JSON.stringify(issue),
    }
    s3.putObject(putParams, function(err, putData) {
      if (error) return callback(error)
      if (DEBUG) {
        console.log(`issue ${issue.number} added to ${IssuesBucket} Bucket`, putData)
      }
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          input: response,
        }),
      })
    })
  })
}

function saveOpenIssue(issue, callback) {
  const putParams = {
    Bucket: IssuesBucket,
    Key: `closed/${issue.number}`,
    Body: JSON.stringify(issue),
  }
  s3.putObject(putParams, function(err, putData) {
    if (error) return callback(error)
    if (DEBUG) {
      console.log(`issue ${issue.number} added to ${IssuesBucket} Bucket`, putData)
    }
    const deletedParams = {
      Bucket: IssuesBucket,
      Key: `open/${issue.number}`,
    }
    s3.deleteObject(deletedParams, function(err, deleteData) {
      if (err) return callback(err)
      if (DEBUG) {
        console.log(`issue ${issue.number} deleted from ${IssuesBucket} Bucket`, deleteData)
      }
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          input: response,
        }),
      })
    })
  })
}
