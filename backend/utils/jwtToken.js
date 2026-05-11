const sendToken = (user, statusCode, res, message = "Success") => {
  const token = user.getJwtToken();
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };

  return res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
  });
};

module.exports = sendToken;
