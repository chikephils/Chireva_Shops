import React from "react";
import ForgotPassword from "../../components/ForgotPassword/ForgotPassword";
import PageTransition from "../../components/UI/PageTransition";

const ForgotPasswordPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <br />
        <br />
        <ForgotPassword />
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
