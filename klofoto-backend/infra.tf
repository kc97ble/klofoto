variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "region" {
  default = "ap-southeast-1"
}

provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region = var.region
}


data "aws_caller_identity" "current" {}


resource "aws_iam_role" "iam_for_lambda_custom" {
  name = "iam_for_lambda_custom"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


resource "aws_lambda_function" "test_lambda" {
  filename = "./target/cloud-computing-pj-dev.jar"
  function_name = "handleRequest-0"
  role = aws_iam_role.iam_for_lambda_custom.arn
  handler = "com.serverless.Handler"

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  source_code_hash = filebase64sha256("./target/cloud-computing-pj-dev.jar")

  runtime = "java8"
  timeout = 6
  memory_size = 1024

  environment {
    variables = {
      EMAIL = "manpreet@bhinder.net"
      SMS = "+6597121419"
      BUCKET_ARN = aws_s3_bucket.bucket.arn
      SQS_ARN = aws_sqs_queue.queue.arn
    }
  }
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.cs5224_test,
    aws_iam_role_policy_attachment.lambda_s3_full_access]
}

resource "aws_lambda_function" "send_email" {
  filename = "./target/cloud-computing-pj-dev.jar"
  function_name = "cs5224-send-email"
  role = aws_iam_role.iam_for_lambda_custom.arn
  handler = "com.serverless.SendEmailHandler"

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  source_code_hash = filebase64sha256("./target/cloud-computing-pj-dev.jar")

  runtime = "java8"
  timeout = 6
  memory_size = 1024

  environment {
    variables = {
      EMAIL = "manpreet@bhinder.net"
      BUCKET_ARN = aws_s3_bucket.bucket.arn
    }
  }
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.cs5224_send_email]
}

# Permission to send email
resource "aws_iam_role_policy" "sendemail_policy" {
  name = "sendemail_lambda_policy"
  role = "${aws_iam_role.iam_for_lambda_custom.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_lambda_function" "send_sms" {
  filename = "./target/cloud-computing-pj-dev.jar"
  function_name = "cs5224-send-sms"
  role = aws_iam_role.iam_for_lambda_custom.arn
  handler = "com.serverless.SendSMSHandler"

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  source_code_hash = filebase64sha256("./target/cloud-computing-pj-dev.jar")

  runtime = "java8"
  timeout = 6
  memory_size = 1024


  environment {
    variables = {
      SMS = "+6597121419"
      BUCKET_ARN = aws_s3_bucket.bucket.arn
    }
  }
}

resource "aws_lambda_function" "get_pre_signed_url" {
  filename = "./target/cloud-computing-pj-dev.jar"
  function_name = "cs5224-get-pre-signed-url"
  role = aws_iam_role.iam_for_lambda_custom.arn
  handler = "com.serverless.GetPresigneURLHandler"

  source_code_hash = filebase64sha256("./target/cloud-computing-pj-dev.jar")

  runtime = "java8"
  timeout = 6
  memory_size = 1024


  environment {
    variables = {
      BUCKET_ARN = aws_s3_bucket.bucket.arn
      BUCKET_ID = aws_s3_bucket.bucket.id
      REGION = var.region
    }
  }
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.cs5224_get_pre_signed_url]
}

//Used to Create API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name = "myapi"
}

//Used to create a Route in the API gateway
resource "aws_api_gateway_resource" "resource" {
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api.id
  path_part = "get_pre_signed_url"
}

//Used to create a API in the API gateway
resource "aws_api_gateway_method" "method" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = "ANY"
  authorization = "NONE"

}

//Used to link the Lambda "get_pre_signed_url" to the API Gateway
resource "aws_api_gateway_integration" "integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.get_pre_signed_url.invoke_arn
}


resource "aws_api_gateway_deployment" "deplyoment" {
  depends_on = [
    aws_api_gateway_integration.integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name = "dev"
}


resource "aws_lambda_permission" "apigw" {
  statement_id = "AllowAPIGatewayInvoke"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_pre_signed_url.function_name
  principal = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  //  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
  source_arn = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.resource.path}"
}

//Used to print out the get_pre_signed_url's link/url
output "base_url_lambda" {
  value = aws_api_gateway_deployment.deplyoment.invoke_url
}

output "bucket_arn" {
  value = aws_s3_bucket.bucket.arn
}


//Used to create S3 Bucket
resource "aws_s3_bucket" "bucket" {
  acl = "public-read-write"
  force_destroy = true

  cors_rule {
    allowed_headers = [
      "*"]
    allowed_origins = [
      "*"]
    allowed_methods = [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"]
  }
}

resource "aws_s3_bucket_policy" "b" {
  bucket = aws_s3_bucket.bucket.id

  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "${aws_s3_bucket.bucket.arn}/*"
        }
    ]
}
POLICY
}

//Used to create folder "toProcess" in the S3 bucket
resource "aws_s3_bucket_object" "toProcess" {
  bucket = aws_s3_bucket.bucket.id
  acl = "public-read"
  key = "toProcess/"
  source = "/dev/null"
}

//Used to create folder "processed" in the S3 bucket
resource "aws_s3_bucket_object" "processed" {
  bucket = aws_s3_bucket.bucket.id
  acl = "public-read"
  key = "processed/"
  source = "/dev/null"
}

//Used to create folder "processed" in the S3 bucket
resource "aws_s3_bucket_object" "styles" {
  bucket = aws_s3_bucket.bucket.id
  acl = "public-read"
  key = "styles/"
  source = "/dev/null"
}


//Used to create a SQS and Allow S3 bucket to send message to the Queue
resource "aws_sqs_queue" "queue" {
  name = "s3-event-notification-queue"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:*:*:s3-event-notification-queue",
      "Condition": {
        "ArnEquals": { "aws:SourceArn": "${aws_s3_bucket.bucket.arn}" }
      }
    },
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "SQS:*",
      "Resource": "arn:aws:sqs:ap-southeast-1:472894326578:s3-event-notification-queue"
    }
  ]
}
POLICY
}

//Created a SNS topic
resource "aws_sns_topic" "topic_toProcess" {
  name = "s3-event-notification-toProcess"

  policy = <<POLICY
{
    "Version":"2012-10-17",
    "Statement":[{
        "Effect": "Allow",
        "Principal": {"AWS":"*"},
        "Action": "SNS:Publish",
        "Resource": "arn:aws:sns:*:*:s3-event-notification-toProcess",
        "Condition":{
            "ArnLike":{"aws:SourceArn":"${aws_s3_bucket.bucket.arn}"}
        }
    }]
}
POLICY
}

//Created a SNS topic
resource "aws_sns_topic" "topic_processed" {
  name = "s3-event-notification-processed"

  policy = <<POLICY
{
    "Version":"2012-10-17",
    "Statement":[{
        "Effect": "Allow",
        "Principal": {"AWS":"*"},
        "Action": "SNS:Publish",
        "Resource": "arn:aws:sns:*:*:s3-event-notification-processed",
        "Condition":{
            "ArnLike":{"aws:SourceArn":"${aws_s3_bucket.bucket.arn}"}
        }
    }]
}
POLICY
}

//Used to send notification to the SNS topics
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.bucket.id

  topic {
    topic_arn = aws_sns_topic.topic_toProcess.arn
    events = [
      "s3:ObjectCreated:*"]
    filter_prefix = "toProcess/"
  }

  topic {
    topic_arn = aws_sns_topic.topic_processed.arn
    events = [
      "s3:ObjectCreated:*"]
    filter_prefix = "processed/"
  }
}

//Used to Link Lambda "send_email" to SNS topic "topic_processed"
resource "aws_sns_topic_subscription" "mapping-processed-email" {
  topic_arn = aws_sns_topic.topic_processed.arn
  protocol = "lambda"
  endpoint = aws_lambda_function.send_email.arn
}

//Used to Link Lambda "send_sms" to SNS topic "topic_processed"
resource "aws_sns_topic_subscription" "mapping-processed-sms" {
  topic_arn = aws_sns_topic.topic_processed.arn
  protocol = "lambda"
  endpoint = aws_lambda_function.send_sms.arn
}

//Used to Link SQS "queue" to SNS topic "topic_toProcess"
resource "aws_sns_topic_subscription" "user_updates_sqs_target" {
  topic_arn = aws_sns_topic.topic_toProcess.arn
  protocol = "sqs"
  endpoint = aws_sqs_queue.queue.arn
}

### Added Logging for Lambdas
resource "aws_cloudwatch_log_group" "cs5224_test" {
  name = "/aws/lambda/cs5224_test"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "cs5224_send_email" {
  name = "/aws/lambda/cs5224-send-email"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "cs5224_send_sms" {
  name = "/aws/lambda/cs5224-send-sms"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "cs5224_get_pre_signed_url" {
  name = "/aws/lambda/cs5224-get-pre-signed_url"
  retention_in_days = 14
}


# See also the following AWS managed policy: AWSLambdaBasicExecutionRole
resource "aws_iam_policy" "lambda_logging" {
  name = "lambda_logging"
  path = "/"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}


# See also the following AWS managed policy: AWSLambdaBasicExecutionRole
resource "aws_iam_policy" "lambda_sms" {
  name = "lambda_sms"
  path = "/"
  description = "IAM policy for SMS from a lambda"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sns:Publish",
            "Resource": "*"
        }
    ]
}
EOF
}

//Used to give permission to access all the S3 buckets
resource "aws_iam_policy" "lambda_s3_full_access" {
  name = "lambda_s3_full_access"
  path = "/"
  description = "IAM policy for S3 from a lambda"


  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_s3_full_access" {
  role = aws_iam_role.iam_for_lambda_custom.name
  policy_arn = aws_iam_policy.lambda_s3_full_access.arn
}



resource "aws_lambda_permission" "with_sns_send_email" {
  statement_id = "AllowExecutionFromSNS"
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.send_email.arn}"
  principal = "sns.amazonaws.com"
  source_arn = "${aws_sns_topic.topic_processed.arn}"
}

resource "aws_lambda_permission" "with_sns_send_sms" {
  statement_id = "AllowExecutionFromSNS"
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.send_sms.arn}"
  principal = "sns.amazonaws.com"
  source_arn = "${aws_sns_topic.topic_processed.arn}"
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role = aws_iam_role.iam_for_lambda_custom.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "lambda_sms" {
  role = aws_iam_role.iam_for_lambda_custom.name
  policy_arn = aws_iam_policy.lambda_sms.arn
}




