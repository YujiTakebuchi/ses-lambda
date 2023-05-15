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
import { confirmVerifiedAndSendEmailSes } from "./aws/SesModules.mjs";

const verifiedCheckInput = undefined;
const verifiedCheckCommand = new ListVerifiedEmailAddressesCommand(
  verifiedCheckInput
);

const createVerifyEmailIdentityCommand = (mailAddress) => {
  return new VerifyEmailIdentityCommand({ EmailAddress: mailAddress });
};

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

  const verifyEmailIdentityCommand =
    createVerifyEmailIdentityCommand(emailAdmin);
  const sendEmailCommand = createSendEmailCommand(
    emailAdmin,
    emailAdmin,
    eventClone
  );

  return Promise.all([
    checkInvalidMailAddressFormat(emailAdmin),
    checkVoidString(eventClone.html),
    checkVoidString(eventClone.subject),
    checkVoidString(eventClone.text),
  ])
    .then((data) => {
      console.log("Success! valid values!");
      console.log(data);
      return confirmVerifiedAndSendEmailSes({
        mailObject: eventClone,
        verifiedCheckCommand,
        verifyEmailIdentityCommand,
        sendEmailCommand,
        mailAddress: emailAdmin,
        sesClient,
      });
    })
    .catch((err) => {
      console.error("Failure...! invalid values!");
      console.error(err);
      callback(err);
      return err;
    });
};
