// create token and saving that in cookies
const sendShopToken = (seller, statusCode, res, message = "Success") => {
  const token = seller.getJwtToken();

  // Options for cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    seller,
    message,
  });
};

module.exports = sendShopToken;
