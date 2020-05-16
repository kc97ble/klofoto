package com.serverless;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.Headers;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class GetPresigneURLHandler implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {

    private static final Logger LOG = LogManager.getLogger(GetPresigneURLHandler.class);

    @Override
    public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {


        String bucketName = System.getenv("BUCKET_ID"); //"cs5224bucket-dev";
        String objectKey = "uploaded/ToDelete";
        String clientRegion = System.getenv("REGION");//"ap-southeast-1";

        Map<String, String> queryStringParameters = (Map<String, String>) input.get("queryStringParameters");
        LOG.info("input: {}", input);
        objectKey = String.format("%s/%s", queryStringParameters.get("folder"), queryStringParameters.get("file"));

        String param_email = getParam(queryStringParameters , "email" , "manpreet@bhinder.net");
        String param_telephone = getParam(queryStringParameters,"telephone","+6597121419");
        String param_style = getParam(queryStringParameters,"style","1");
        String param_iter = getParam(queryStringParameters,"iter", "1000");

        LOG.info("email: {}", param_email);
        LOG.info("telephone: {}", param_telephone);
        LOG.info("objectKey: {}", objectKey);
        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(clientRegion)
                .build();

        // Set the presigned URL to expire after one hour.
        java.util.Date expiration = new java.util.Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * 60 * 60;
        expiration.setTime(expTimeMillis);

        // Generate the presigned URL.
        System.out.println("Generating pre-signed URL.");
        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                        .withMethod(HttpMethod.PUT)
                        .withExpiration(expiration);

//        if(param_email == null)
//            param_email = "";
//
//        if(param_telephone == null)
//            param_telephone = "+6597121419";
//
//        if(param_style == null)
//            param_style = "1";
//
//        if(param_iter == null)
//            param_iter = "1000";


        generatePresignedUrlRequest.addRequestParameter(Headers.S3_USER_METADATA_PREFIX + "email", param_email);
        generatePresignedUrlRequest.addRequestParameter(Headers.S3_USER_METADATA_PREFIX + "telephone", param_telephone);
        generatePresignedUrlRequest.addRequestParameter(Headers.S3_USER_METADATA_PREFIX + "style", param_style);
        generatePresignedUrlRequest.addRequestParameter(Headers.S3_USER_METADATA_PREFIX + "iter", param_iter);

        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);

        LOG.info("Pre-Signed URL: {}", url.toString());
        System.out.println("Pre-Signed URL: " + url.toString());
        HashMap<String, Object> returnMap = new HashMap<>();
        returnMap.put("url", url.toString());
        PreSignedURLResponse responseBody = new PreSignedURLResponse("SUCCESSFUL", returnMap);


        HashMap<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        //  'Access-Control-Allow-Credentials': true,
        // https://serverless.com/blog/cors-api-gateway-survival-guide/
        return ApiGatewayResponse.builder()
                .setStatusCode(200)
                .setObjectBody(responseBody)
                .setHeaders(headers)
                .build();
    }



    private String getParam(Map<String, String> queryStringParameters, String key, String defaultValue){
        String result = queryStringParameters.get(key);
        if (result == null){
            LOG.info("{} is null, fallback to default {}",key, defaultValue);
            return defaultValue;
        }
        return result;
    }

}

class PreSignedURLResponse {

    private final String message;
    private final Map<String, Object> input;

    public PreSignedURLResponse(String message, Map<String, Object> input) {
        this.message = message;
        this.input = input;
    }

    public String getMessage() {
        return this.message;
    }

    public Map<String, Object> getInput() {
        return this.input;
    }
}

