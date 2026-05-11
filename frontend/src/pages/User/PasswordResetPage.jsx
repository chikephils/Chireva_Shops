import React from "react";
import PasswordReset from "../../components/ForgotPassword/PasswordReset";
import PageTransition from "../../components/UI/PageTransition";

const PasswordResetPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <PasswordReset />
      </div>
    </PageTransition>
  );
};

export default PasswordResetPage;
