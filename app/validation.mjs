export const checkInvalidMailAddressFormat = async (mailAddress) => {
  const mailPattern =
    /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
  if (!mailPattern.test(mailAddress)) {
    const invalidMailAddressError = {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        errorMessage:
          "メールアドレスのフォーマットがhogehoge@example.comのようになっていません。",
      },
    };
    const resJson = JSON.stringify(invalidMailAddressError);
    throw new Error(resJson);
  }
  return null;
};

export const checkVoidString = async (str) => {
  if (!str) {
    const voidStringError = {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        errorMessage: "テキストが未入力です。",
      },
    };
    const resJson = JSON.stringify(voidStringError);
    throw new Error(resJson);
  }
  return null;
};
