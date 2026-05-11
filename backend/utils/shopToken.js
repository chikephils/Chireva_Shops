// create token and saving that in cookies
const sendShopToken = (seller, statusCode, res, message = "Success") => {
  const token = seller.getJwtToken();
  const isProduction = process.env.NODE_ENV === "production";

  // Options for cookies
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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
