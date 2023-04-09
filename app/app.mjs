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
  const REGION = "ap-northeast-1";
  const sesClient = new SESClient({ region: REGION });

  const params = {
    Source: "hoge@gmail.com",
    Destination: { ToAddresses: ["hoge@gmail.com"] },
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
