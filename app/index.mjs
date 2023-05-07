import dotenv from "dotenv";
import {
  SESClient,
  ListVerifiedEmailAddressesCommand,
  VerifyEmailIdentityCommand,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import {
  checkInvalidMailAddressFormat,
  checkVoidString,
} from "./validation.mjs";

const createSendEmailCommand = (toAddress, fromAddress, contentObj) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: contentObj?.html ?? "HTML_FORMAT_BODY",
        },
        Text: {
          Charset: "UTF-8",
          Data: contentObj?.text ?? "TEXT_FORMAT_BODY",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: contentObj?.subject ?? "EMAIL_SUBJECT",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const createVerifyEmailIdentityCommand = (emailAddress) => {
  return new VerifyEmailIdentityCommand({ EmailAddress: emailAddress });
};

const verifyAndSendEmailSes = (sesClient, emailAddress, mailObject) => {
  const sendEmailCommand = createSendEmailCommand(
    emailAddress,
    emailAddress,
    mailObject
  );
  const verifyEmailIdentityCommand =
    createVerifyEmailIdentityCommand(emailAddress);

  return sesClient
    .send(verifyEmailIdentityCommand)
    .then(() => {
      return sesClient.send(sendEmailCommand);
    })
    .then((res) => {
      console.log("Success to send email.");
      console.log("not verified");
      return res;
    })
    .catch((err) => {
      console.error("Failed to send email.");
      console.error(err);
      return err;
    });
};

const sendEmailSes = (sesClient, emailAddress, mailObject) => {
  const sendEmailCommand = createSendEmailCommand(
    emailAddress,
    emailAddress,
    mailObject
  );

  return sesClient
    .send(sendEmailCommand)
    .then((res) => {
      console.log("Success to send email.");
      console.log("verified");
      return res;
    })
    .catch((err) => {
      console.error("Failed to send email.");
      console.error(err);
      return err;
    });
};

export const handler = (event, context, callback) => {
  const eventClone = event;
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
  checkInvalidMailAddressFormat(emailAdmin, callback);

  // 空文字チェック、TODO:func 後で関数でまとめられる様に
  checkVoidString(eventClone.html, callback);
  checkVoidString(eventClone.subject, callback);
  checkVoidString(eventClone.text, callback);

  const verifiedCheckInput = undefined;
  const verifiedCheckCommand = new ListVerifiedEmailAddressesCommand(
    verifiedCheckInput
  );

  return sesClient
    .send(verifiedCheckCommand)
    .then((res) => {
      const verifiedEmailList = res.VerifiedEmailAddresses;
      return verifiedEmailList.includes(emailAdmin)
        ? sendEmailSes(sesClient, emailAdmin, eventClone)
        : verifyAndSendEmailSes(sesClient, emailAdmin, eventClone);
    })
    .then(() => {
      console.log("send mail complete");
    })
    .catch((err) => {
      console.error(err);
    });
};
