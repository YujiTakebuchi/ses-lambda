import dotenv from "dotenv";
import {
  SESClient,
  ListVerifiedEmailAddressesCommand,
  VerifyEmailIdentityCommand,
  SendEmailCommand,
} from "@aws-sdk/client-ses";

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

const createVerifyEmailIdentityCommand = (emailAddress) => {
  return new VerifyEmailIdentityCommand({ EmailAddress: emailAddress });
};

export const handler = async (event) => {
  dotenv.config();
  const env = process.env;
  const REGION = env.AWS_REGION;
  const sesClient = new SESClient({
    region: REGION,
    endpoint: env.LOCALSTACK_HOSTNAME
      ? `http://${env.LOCALSTACK_HOSTNAME}:4566`
      : null,
  });

  const emailAdmin = env.EMAIL_ADMIN;
  const verifyEmailIdentityCommand =
    createVerifyEmailIdentityCommand(emailAdmin);
  const sendEmailCommand = createSendEmailCommand(emailAdmin, emailAdmin);

  const verifiedCheckInput = undefined;
  const verifiedCheckCommand = new ListVerifiedEmailAddressesCommand(
    verifiedCheckInput
  );

  return sesClient.send(verifiedCheckCommand).then((res) => {
    console.log(res);
    const verifiedEmailList = res.VerifiedEmailAddresses;
    return verifiedEmailList.includes(emailAdmin)
      ? sesClient
          .send(sendEmailCommand)
          .then((res) => {
            console.log("Success to send email.");
            console.log("veried admin e-mail address");
            return res;
          })
          .catch((err) => {
            console.error("Failed to send email.");
            console.error(err);
            return err;
          })
      : sesClient
          .send(verifyEmailIdentityCommand)
          .then(() => {
            return sesClient.send(sendEmailCommand);
          })
          .then((res) => {
            console.log("Success to send email.");
            console.log("veried admin e-mail address");
            return res;
          })
          .catch((err) => {
            console.error("Failed to send email.");
            console.error(err);
            return err;
          });
  });
};
