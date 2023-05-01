export const checkInvalidMailAddressFormat = (mailAddress, callback) => {
  console.log("check!");
  console.log(callback);
  const mailPattern =
    /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
  if (!mailPattern.test(mailAddress)) {
    const invalidMailAddressError = {
      statusCode: 400,
      body: {
        errorMessage:
          "メールアドレスのフォーマットがhogehoge@example.comのようになっていません。",
      },
    };
    callback(JSON.stringify(invalidMailAddressError));
  }
  return null;
};
