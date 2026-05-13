const sendToken = (user, statusCode, res, message = "Success") => {
  const token = user.getJwtToken();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
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
