import * as dotenv from "dotenv";
import { SESClient } from "@aws-sdk/client-ses";
import { SendEmailCommand } from "@aws-sdk/client-ses";

const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
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
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

export const handler = async (event) => {
  dotenv.config();
  const env = process.env;
  console.log(env.EMAIL_ADMIN);
  const REGION = "ap-northeast-1";
  const sesClient = new SESClient({ region: REGION });

  const params = {
    Source: env.EMAIL_ADMIN,
    Destination: { ToAddresses: [env.EMAIL_ADMIN] },
    Message: {
      Subject: { Data: "subject hogehoge" },
      Body: {
        Text: { Data: "body message hogehoge" },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);
  // const sendEmailCommand = createSendEmailCommand(
  //   "hoge@example.com",
  //   "sender@example.com"
  // );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    return e;
  }
  // // TODO implement
  // const response = {
  //     statusCode: 200,
  //     body: JSON.stringify('Hello from Lambda!'),
  // };
  // return response;
};
