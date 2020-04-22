import boto3
import json
from styleTransfer import style_transfer
from PIL import Image
import io
import requests
import time


while(1):

	# Create SQS client
	REGION = 'ap-southeast-1'
	ACCESS_KEY = 'AKIAW4GVSY4ZOOW275R6'
	SECRET_KEY = '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'

	sqs = boto3.client('sqs',region_name=REGION,aws_access_key_id=ACCESS_KEY,
		aws_secret_access_key=SECRET_KEY)

	queue_url = 'https://sqs.ap-southeast-1.amazonaws.com/472894326578/s3-event-notification-queue'

	# Receive message from SQS queue
	response = sqs.receive_message(
		QueueUrl=queue_url,
		AttributeNames=[
			'SentTimestamp'
		],
		MaxNumberOfMessages=1,
		MessageAttributeNames=[
			'All'
		],
		VisibilityTimeout=0,
		WaitTimeSeconds=0
	)
	print(response)
	if 'Messages' not in response:
		
		time.sleep(5)
		print("No image uploaded...")
		continue
	message = response['Messages'][0]
	receipt_handle = message['ReceiptHandle']
	message_body = message['Body']

	message_1 = json.loads(message_body)["Message"]

	records = json.loads(message_1)["Records"]

	s3_str = records[0]["s3"]

	bucket_name = s3_str["bucket"]["name"]

	object_key = s3_str["object"]["key"]

	s3 = boto3.resource('s3',region_name = REGION,aws_access_key_id=ACCESS_KEY,
		aws_secret_access_key=SECRET_KEY)
	obj = s3.Object(bucket_name, object_key)

	email = obj.metadata['email']
	telephone = obj.metadata['telephone']
	style = obj.metadata['style']
	iter = int(obj.metadata['iter'])
	
	print(obj.metadata)

	print ("email: "+email+";telephone: "+telephone)

	#style_transfer()

	# Delete received message from queue

	sqs.delete_message(
		QueueUrl=queue_url,
		ReceiptHandle=receipt_handle
	)

	import calendar;
	import time;
	ts = calendar.timegm(time.gmtime())

	print(object_key)

	object_key_file = object_key.split("/")[1]
	format = object_key_file.split(".")[1]

	toprocess_file_name = str(ts)+"."+format
	processed_toprocess_file_name = 'stylized-image.'+format
	#content_img_data = obj.get().get('Body').read()
	s3.Bucket(bucket_name).download_file(object_key, toprocess_file_name)
	'''
	print(type(content_img_data))
	img = Image.open(io.BytesIO(content_img_data))

	print(type(img))

	import matplotlib

	matplotlib.image.imsave('tmp_img.png', img)
	'''
	print("image retrieved!!")
	
	style_file_name = 'style-photos/' + style
	
	state = style_transfer(toprocess_file_name, style_file_name,processed_toprocess_file_name, iter)

	def getsignedUrl():
		URL = 'https://vzanfo84jd.execute-api.ap-southeast-1.amazonaws.com/dev/get_pre_signed_url?folder=processed&file='+object_key_file +'&email='+email+'&telephone='+telephone
		r = requests.get(URL)
		print(r.json()["input"]["url"])
		print(URL)

		requests.put(r.json()["input"]["url"], open(processed_toprocess_file_name, 'rb'))
		return "DONE";
	getsignedUrl()
	print('Received bucket name and object key:' +bucket_name+", "+object_key)
	
	import os
	if os.path.exists(toprocess_file_name):
		os.remove(toprocess_file_name)
	else:
		print("The file does not exist")
	