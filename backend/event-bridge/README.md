event pattern

{
  "source": ["aws.s3"],
  "detail-type": ["Object Created"],
  "detail": {
    "bucket": {
      "name": ["rentguard-contracts-moty-101225"]
    },
    "object": {
      "key": [{
        "prefix": "uploads/"
      }]
    }
  }
}

Input path
{
  "bucket": "$.detail.bucket.name",
  "key": "$.detail.object.key"
}
Input template 
{
  "bucket": <bucket>,
  "key": <key>
}