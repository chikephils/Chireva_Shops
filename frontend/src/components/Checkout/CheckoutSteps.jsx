import React from "react";

const CheckoutSteps = ({ active = 1 }) => {
  const steps = [
    { label: "Shipping", number: 1 },
    { label: "Payment", number: 2 },
    { label: "Success", number: 3 },
  ];

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto px-8 md:px-3">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${
                  active >= step.number
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-300 text-gray-600"
                }
              `}
            >
              {step.number}
            </div>
            <span
              className={`
                mt-2 text-xs md:text-sm font-medium whitespace-nowrap
                ${active >= step.number ? "text-red-600" : "text-gray-500"}
              `}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line (except last step) */}
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-0.5 mx-2 md:mx-6 transition-all
                ${active > step.number ? "bg-red-600" : "bg-gray-300"}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
