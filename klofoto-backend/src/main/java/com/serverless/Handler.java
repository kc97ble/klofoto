package com.serverless;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.Bucket;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Handler implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {

	private static final Logger LOG = LogManager.getLogger(Handler.class);

	@Override
	public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {
		LOG.info("received: {}", input);

		final AmazonS3 s3 = AmazonS3ClientBuilder.standard().withRegion(Regions.AP_SOUTHEAST_1).build();
		List<Bucket> buckets = s3.listBuckets();
		LOG.info("Your Amazon S3 buckets are:");
		for (Bucket b : buckets) {
			LOG.info("* " + b.getName());
		}


		Map<String, String> userMetadata = s3.getObject("terraform-20200418031709616800000001", "processed/29f7b81e-79b8-4260-8f6a-f2dcce15b8ea.png").getObjectMetadata().getUserMetadata();
		LOG.info("keys " + userMetadata.keySet().stream().reduce((s, s2) -> s = s +" "+ s2).get());
		LOG.info("email " + userMetadata.get("email"));
		LOG.info("telephone " + userMetadata.get("telephone"));

		Response responseBody = new Response("Go Serverless v1.x! Your function executed successfully!", input);
		return ApiGatewayResponse.builder()
				.setStatusCode(200)
				.setObjectBody(responseBody)
				.setHeaders(Collections.singletonMap("X-Powered-By", "AWS Lambda & serverless"))
				.build();
	}
}
