export const checkInvalidMailAddressFormat = (mailAddress, callback) => {
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

export const checkVoidString = (str, callback) => {
  if (!str) {
    const voidStringError = {
      statusCode: 400,
      body: {
        errorMessage: "テキストが未入力です。",
      },
    };
    const resJson = JSON.stringify(voidStringError);
    callback(resJson);
    return resJson;
  }
  return null;
};
