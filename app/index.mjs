import dotenv from "dotenv";
import { SESClient } from "@aws-sdk/client-ses";
import { SendEmailCommand } from "@aws-sdk/client-ses";

const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "HTML_FORMAT_BODY",
        },
        Text: {
          Charset: "UTF-8",
          Data: "TEXT_FORMAT_BODY",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "EMAIL_SUBJECT",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

export const handler = async (event) => {
  dotenv.config();
  const env = process.env;
  const REGION = "ap-northeast-1";
  const sesClient = new SESClient({
    region: REGION,
    endpoint: env.LOCALSTACK_HOSTNAME
      ? `http://${env.LOCALSTACK_HOSTNAME}:4566`
      : null,
  });

  const sendEmailCommand = createSendEmailCommand(
    env.EMAIL_ADMIN,
    env.EMAIL_ADMIN
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    console.error(e);
    return e;
  }
};
