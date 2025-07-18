import React from "react";
import { FaCreditCard } from "react-icons/fa";

const SubscriptionTab = () => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg text-center min-h-[300px] flex flex-col justify-center items-center">
      <FaCreditCard className="text-6xl text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Subscription Details
      </h3>
      <p className="text-gray-500 max-w-md">
        Manage your subscription plan, view billing history, and update payment
        methods here. This section is under development.
      </p>
    </div>
  );
};

export default SubscriptionTab;
