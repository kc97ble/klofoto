


```
terraform init
terraform plan -out="terra.tfplan" 
terraform apply "terra.tfplan"

terraform plan -out="terra.tfplan" && terraform apply "terra.tfplan"
terraform destroy



```

```roomsql


resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.bucket.id

  #queue {
  #  id = "toProcess-event"
  #  queue_arn = aws_sqs_queue.queue.arn
  #  events = [
  #    "s3:ObjectCreated:*"]
  #  filter_prefix = "toProcess/"
  #}

  #queue {
   # id = "processed-event"
   # queue_arn = aws_sqs_queue.queue.arn
   # events = [
   #   "s3:ObjectCreated:*"]
   # filter_prefix = "processed/"
  #}

 # lambda_function {
 #   id = "toProcess-lambda"
 #   lambda_function_arn = "${aws_lambda_function.test_lambda.arn}"
 #   events              = ["s3:ObjectCreated:*"]
 #   filter_prefix       = "toProcess/"
  #}

  topic {
    topic_arn     = "${aws_sns_topic.topic_toProcess.arn}"
    events        = ["s3:ObjectCreated:*"]
    filter_prefix = "toProcess/"
  }

  topic {
    topic_arn     = "${aws_sns_topic.topic_processed.arn}"
    events        = ["s3:ObjectCreated:*"]
    filter_prefix = "processed/"
  }

  #depends_on = [aws_lambda_permission.allow_bucket]
}

# resource "aws_lambda_event_source_mapping" "send_email_mapping" {
#  event_source_arn = "${aws_sqs_queue.queue.arn}"
#  function_name    = "${aws_lambda_function.test_lambda.arn}"
#}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.test_lambda.arn}"
  principal     = "s3.amazonaws.com"
  source_arn    = "${aws_s3_bucket.bucket.arn}"
}

resource "aws_sns_topic_subscription" "toProcess_lamada_target" {
  topic_arn = aws_sns_topic.topic_toProcess.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.test_lambda.arn
}

resource "aws_sns_topic_subscription" "processed_lamada_target" {
  topic_arn = aws_sns_topic.topic_processed.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.test_lambda.arn
}

```


This make all the lambdas to have a API Gateway
https://learn.hashicorp.com/terraform/aws/lambda-api-gateway#creating-the-lambda-function



### Get Presigned URL
```bash
curl --location --request GET 'https://vzanfo84jd.execute-api.ap-southeast-1.amazonaws.com/dev/get_pre_signed_url?folder=toProcess&file=foo3'
```


### Upload image
```bash
curl --location --request PUT 'https://terraform-20200418031709616800000001.s3.ap-southeast-1.amazonaws.com/toProcess/foo3?x-amz-meta-telephone=%2B6597121419&x-amz-meta-email=manpreet%40bhinder.net&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLXNvdXRoZWFzdC0xIkYwRAIgTRyBMEpoay2cUCfSo786h0cpZX0ZkT%2FEVCW2ESte%2BRQCIB0Jw%2BUR2P48rS3tmc1mrLe%2Fs3U2c4Vzr3D8wzysl4MuKuEBCM3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMNDcyODk0MzI2NTc4IgyQX%2FgzE%2FJaeYnXGLsqtQEro%2FrsVjpCJUqYVTVm0uBqaVnNxCE9FcvVJWhGxF0N%2FaDfUNTiUae8OiYW%2B9KOW5dKRyvXYkvfmgzK8stnNKtbsnyqkH7I%2BdXxdkuqUNKNa5HbuImGx%2F3KuhWxHhMeerMrn0HoY%2BBEbQPffIHZ8vgRMJxUWUlvwgIOI%2FTf2LsIqFmw7gAD7IngvXq636TlaKHNCMUHShqXVOYRR2puyF6M6%2Fokq8YVnzofv8YumqPAP7SPtI9RMLzs6fQFOuEBLZFWsS5WOCUop47nyCHZZff1Xj7YBC3P8EzLBWW1CFhfDaalYxZPvCKdGHCn%2FF6GF6OLHrnorjpJEN2vpXUYJ8givL%2BwXu4wnlp3LQEMF23dpia1EG88F5fdIIJ%2FIvSt17S58WXkA4mJazno4AJnxBK8s%2F0wpE%2Bh6xKcvq8QwZPbFtHBsU1YNJIWHuN%2Fl93GIAicVAKdSeUw7VICfwCmsOTVP6nUP5BNfXJV%2FUuBTj%2FkQXAV%2BkJ7bcrtlasgCxy1oaVhgVxZJ2mB%2FPNcl3SoKAi4Rm9NQrJDlYzRLsGE6HOE&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200418T033841Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=ASIAW4GVSY4ZJIB2KFVY%2F20200418%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=d3946f7fdf15017877eb1523774d264080e257f1b69be90572c0133dd31e9e1b' \
--header 'Content-Type: application/json' \
--header 'Content-Type: application/octet-stream' \
--data-binary '@/home/mannu/Documents/ToDelete'
```


