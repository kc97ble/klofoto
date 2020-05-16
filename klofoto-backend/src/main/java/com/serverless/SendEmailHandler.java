package com.serverless;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.BsonDocument;

import java.util.Collections;
import java.util.Map;

public class SendEmailHandler implements RequestHandler<SNSEvent, ApiGatewayResponse> {

	private static final Logger LOG = LogManager.getLogger(SendEmailHandler.class);
	private static final AmazonS3 s3 = AmazonS3ClientBuilder.standard().withRegion(Regions.AP_SOUTHEAST_1).build();

	@Override
	public ApiGatewayResponse handleRequest(SNSEvent input, Context context) {
		LOG.info("received: {}", input);

		if (input.getRecords().size() == 0)
			return ApiGatewayResponse.builder()
					.setStatusCode(303)
					.setObjectBody("Records size is 0")
					.build();


		SNSEvent.SNSRecord snsRecord = input.getRecords().get(0);
		BsonDocument record = BsonDocument.parse(snsRecord.getSNS().getMessage()).getArray("Records").get(0).asDocument();

		String bucket = record.getDocument("s3").getDocument("bucket").getString("name").getValue();
		String region = record.getString("awsRegion").getValue();
		String key = record.getDocument("s3").getDocument("object").getString("key").getValue();

		String URL = String.format("https://%s.s3-%s.amazonaws.com/%s", bucket, region, key);
		LOG.info("URL: " + URL);
		// Replace sender@example.com with your "From" address.
		// This address must be verified with Amazon SES.

		Map<String, String> userMetadata = s3.getObject(bucket, key).getObjectMetadata().getUserMetadata();

		final String FROM = "manpreet@bhinder.net";

		// Replace recipient@example.com with a "To" address. If your account
		// is still in the sandbox, this address must be verified.
		String TO = "manpreet@bhinder.net";

		if (userMetadata.containsKey("email")) {
			TO= userMetadata.get("email");
			LOG.info("TO " + TO);
		}


		// The configuration set to use for this email. If you do not want to use a
		// configuration set, comment the following variable and the
		// .withConfigurationSetName(CONFIGSET); argument below.
		//final String CONFIGSET = "ConfigSet";

		// The subject line for the email.
		final String SUBJECT = "Cloud Photo Stylizer";

		// The HTML body for the email.
		final String HTMLBODY = "<h1>Image Processed!</h1>"
				+ "<p>This email was sent from Cloud Painter."
				+ "URL to download the image : <a href='"+URL+"'>"
				+ "Download</a>";

		// The email body for recipients with non-HTML email clients.
		final String TEXTBODY = "This email was sent through Amazon SES "
				+ "using the AWS SDK for Java.";

		try {
			AmazonSimpleEmailService client =
					AmazonSimpleEmailServiceClientBuilder.standard()
							// Replace US_WEST_2 with the AWS Region you're using for
							// Amazon SES.
							.withRegion(Regions.AP_SOUTH_1).build();
			SendEmailRequest request = new SendEmailRequest()
					.withDestination(
							new Destination().withToAddresses(TO))
					.withMessage(new Message()
							.withBody(new Body()
									.withHtml(new Content()
											.withCharset("UTF-8").withData(HTMLBODY))
									.withText(new Content()
											.withCharset("UTF-8").withData(TEXTBODY)))
							.withSubject(new Content()
									.withCharset("UTF-8").withData(SUBJECT)))
					.withSource(FROM);
					// Comment or remove the next line if you are not using a
					// configuration set
					//.withConfigurationSetName(CONFIGSET);
			client.sendEmail(request);
			LOG.info("Email sent!");
		} catch (Exception ex) {
			LOG.info("The email was not sent. Error message: "
					+ ex.getMessage());
		}


//		Response responseBody = new Response("Go Serverless v1.x! Your function executed successfully!", input);
		return ApiGatewayResponse.builder()
				.setStatusCode(200)
				.setObjectBody("Email Sent")
				.setHeaders(Collections.singletonMap("X-Powered-By", "AWS Lambda & serverless"))
				.build();
	}
}
