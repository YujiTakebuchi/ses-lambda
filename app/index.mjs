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

const createVerifyEmailIdentityCommand = (mailAddress) => {
  return new VerifyEmailIdentityCommand({ EmailAddress: mailAddress });
};

const verifyEmailAddressSes = ({ sesClient, mailAddress, callback }) => {
  const verifyEmailIdentityCommand =
    createVerifyEmailIdentityCommand(mailAddress);
  console.log(mailAddress);
  return sesClient
    .send(verifyEmailIdentityCommand)
    .then((res) => {
      console.log("Success to verify email addmin");
      console.log(res);
      const successRes = {
        statusCode: 200,
        body: {
          errorMessage: "メールアドレス検証成功",
        },
      };
      const resJson = JSON.stringify(successRes);
      return resJson;
    })
    .catch((err) => {
      console.error("Failed to send email.");
      console.error(err);
      const awsError = {
        statusCode: 500,
        body: {
          errorMessage:
            "メールアドレス検証に問題がありました。Lambdaのログを確認してください。",
        },
      };
      const resJson = JSON.stringify(awsError);
      callback(resJson);
      return resJson;
    });
};

const sendEmailSes = ({ mailObject, sesClient, mailAddress, callback }) => {
  const sendEmailCommand = createSendEmailCommand(
    mailAddress,
    mailAddress,
    mailObject
  );

  return sesClient
    .send(sendEmailCommand)
    .then((res) => {
      console.log("Success to send email.");
      console.log(res);
      const successRes = {
        statusCode: 200,
        body: {
          errorMessage: "メール送信成功",
        },
      };
      const resJson = JSON.stringify(successRes);
      return resJson;
    })
    .catch((err) => {
      console.error("Failed to send email.");
      console.error(err);
      const awsError = {
        statusCode: 500,
        body: {
          errorMessage:
            "メール送信に問題がありました。Lambdaのログを確認してください。",
        },
      };
      const resJson = JSON.stringify(awsError);
      callback(resJson);
      return resJson;
    });
};

const verifyAndSendEmailSes = ({ mailObject, ...sesSet }) => {
  return verifyEmailAddressSes({
    mailObject,
    ...sesSet,
  })
    .then(() => {
      return sendEmailSes({ mailObject, ...sesSet });
    })
    .catch((err) => {
      console.error("Failed to send email.");
      console.error(err);
      return err;
    });
};

const confirmVerifiedAndSendEmailSes = ({ mailObject, ...sesSet }) => {
  const verifiedCheckInput = undefined;
  const verifiedCheckCommand = new ListVerifiedEmailAddressesCommand(
    verifiedCheckInput
  );

  return sesSet.sesClient
    .send(verifiedCheckCommand)
    .then((res) => {
      const verifiedEmailList = res.VerifiedEmailAddresses;
      return verifiedEmailList.includes(sesSet.mailAddress)
        ? sendEmailSes({ mailObject, ...sesSet })
        : verifyAndSendEmailSes({ mailObject, ...sesSet });
    })
    .then((res) => {
      console.log("send mail complete");
      return res;
    })
    .catch((err) => {
      console.error(err);
      const awsError = {
        statusCode: 500,
        body: {
          errorMessage:
            "メール検証済みチェックに問題がありました。Lambdaのログを確認してください。",
        },
      };
      const resJson = JSON.stringify(awsError);
      return resJson;
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

  const sesSet = {
    sesClient,
    mailAddress: emailAdmin,
    callback,
  };

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
        ...sesSet,
      });
    })
    .catch((err) => {
      console.error("Failure...! invalid values!");
      console.error(err);
      callback(null, err);
      return err;
    });
};
