package com.serverless;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.BsonDocument;

import java.util.HashMap;
import java.util.Map;

public class SendSMSHandler implements RequestHandler<SNSEvent, String> {

    private static final Logger LOG = LogManager.getLogger(SendSMSHandler.class);

    private static final AmazonS3 s3 = AmazonS3ClientBuilder.standard().withRegion(Regions.AP_SOUTHEAST_1).build();


    @Override
    public String handleRequest(SNSEvent input, Context context) {

        LambdaLogger logger = context.getLogger();
        logger.log("received: " + input);


        //LOG.info("email " + userMetadata.get("email"));


//        logger.log("Records: " + input.get("Records"));
//        logger.log("requestParameters: " + input.get("requestParameters"));
//        logger.log("s3: " + input.get("s3"));
//        logger.log("userIdentity: " + input.get("userIdentity"));
//        logger.log("object: " + input.get("object"));
//        logger.log("Keys: " + input.keySet().stream().reduce((s, s2) -> s = s + " "+s2).get());
//        BsonArray records = BsonArray.parse(input.get("Records").toString());
//
        if (input.getRecords().size() == 0)
            return new ErrorResponse("records size = 0;").toJson();

        SNSEvent.SNSRecord snsRecord = input.getRecords().get(0);
        logger.log("sqsMessage: " + snsRecord.getSNS().getMessage());
//        logger.log("sqsMessage.getBody: " +  input.toJson());
        BsonDocument record = BsonDocument.parse(snsRecord.getSNS().getMessage()).getArray("Records").get(0).asDocument();
        logger.log("Records: " + record.toJson());


        String bucket = record.getDocument("s3").getDocument("bucket").getString("name").getValue();
        String region = record.getString("awsRegion").getValue();
        String key = record.getDocument("s3").getDocument("object").getString("key").getValue();

        String URL = String.format("https://%s.s3-%s.amazonaws.com/%s", bucket, region, key);
        logger.log("URL: " + URL);

        //https://terraform-20200418031709616800000001.s3-ap-southeast-1.amazonaws.com/processed/bc25010c-f631-4658-aa8b-501b356125a5.png
        //https://terraform-20200418031709616800000001.s3-ap-southeast-1.amazonaws.com/ap-southeast-1

        Map<String, String> userMetadata = s3.getObject(bucket, key).getObjectMetadata().getUserMetadata();

        context.getLogger().log("SendSMSHandler triggered");

        String senderId = "Manpreet";
        String smsType = "Transactional";
        context.getLogger().log("SendSMSHandler simpleSMS creating");
        SimpleSMS simpleSMS = new SimpleSMS(senderId, smsType);
        context.getLogger().log("SendSMSHandler simpleSMS created");

        String message = "Cloud Photo Stylizer \n\r Image Processed : " + URL;
        String phoneNumber = "+6597121419";

        if (userMetadata.containsKey("telephone")) {
            phoneNumber= userMetadata.get("telephone");
            LOG.info("telephone " + phoneNumber);
        }

        String res;
        try {
            res = simpleSMS.sendSMSMessage(message, phoneNumber);
            LOG.info("Sent an SMS '" + message + "' to " + phoneNumber + " : " + res);
        } catch (Exception e) {
            LOG.error("An error occured: " + e.getMessage());
            res = new ErrorResponse("An error occured: " + e).toJson();
        }

        return res;
    }
}

class SimpleSMS {

    private Map<String, MessageAttributeValue> smsAttributes;

    public SimpleSMS(String senderID, String smsType) {

        smsAttributes =
                new HashMap<String, MessageAttributeValue>();

        smsAttributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
                .withStringValue(senderID) //The sender ID shown on the device.
                .withDataType("String"));

        smsAttributes.put("AWS.SNS.SMS.SMSType", new MessageAttributeValue()
                .withStringValue(smsType) //Sets the type to promotional.
                .withDataType("String"));

    }

    public String sendSMSMessage(String message,
                                 String phoneNumber) {

        AmazonSNSClient snsClient = new AmazonSNSClient(new ClientConfiguration());


        PublishResult result = snsClient.publish(new PublishRequest()
                .withMessage(message)
                .withPhoneNumber(phoneNumber)
                .withMessageAttributes(smsAttributes));

        return result.toString(); // Returns the message ID.
    }

}
