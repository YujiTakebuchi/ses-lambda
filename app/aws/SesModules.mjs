import { ListVerifiedEmailAddressesCommand } from "@aws-sdk/client-ses";

export const verifyEmailAddressSes = async ({
  sesClient,
  verifyEmailIdentityCommand,
}) => {
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
      throw new Error(resJson);
    });
};

export const sendEmailSes = async ({ sesClient, sendEmailCommand }) => {
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
      throw new Error(resJson);
    });
};

export const verifyAndSendEmailSes = async ({
  mailObject,
  verifyEmailIdentityCommand,
  sendEmailCommand,
  sesClient,
}) => {
  return verifyEmailAddressSes({
    mailObject,
    verifyEmailIdentityCommand,
    sesClient,
  })
    .then(() => {
      return sendEmailSes({ sendEmailCommand, sesClient });
    })
    .catch((err) => {
      console.error("Failed to send email.");
      console.error(err);
      return err;
    });
};

export const confirmVerifiedAndSendEmailSes = async ({
  mailObject,
  verifiedCheckCommand,
  verifyEmailIdentityCommand,
  sendEmailCommand,
  mailAddress,
  sesClient,
}) => {
  return sesClient
    .send(verifiedCheckCommand)
    .then((res) => {
      const verifiedEmailList = res.VerifiedEmailAddresses;
      return verifiedEmailList.includes(mailAddress)
        ? sendEmailSes({ mailObject, sendEmailCommand, sesClient })
        : verifyAndSendEmailSes({
            mailObject,
            verifyEmailIdentityCommand,
            sendEmailCommand,
            sesClient,
          });
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
      throw new Error(resJson);
    });
};
