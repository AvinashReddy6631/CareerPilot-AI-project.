import api from "./api";

export const createSubscription = async (plan) => {
  const response = await api.post("/payment/create-subscription", {
    plan,
  });

  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post("/payment/verify-payment", paymentData);

  return response.data;
};

export const openRazorpayCheckout = async (plan) => {
  const data = await createSubscription(plan);

  if (!data.success || !data.subscription?.id) {
    throw new Error("Unable to create subscription");
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,

    subscription_id: data.subscription.id,

    name: "CareerPilot AI",
    description: `${plan} subscription`,

    handler: async function (response) {
      console.log("Razorpay payment response:", response);

      const verification = await verifyPayment(response);

      console.log("Payment verification:", verification);
    },

    theme: {
      color: "#3399cc",
    },
  };

  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout is not loaded");
  }

  const razorpay = new window.Razorpay(options);

  razorpay.open();
};