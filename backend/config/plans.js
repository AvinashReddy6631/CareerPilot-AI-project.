const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    billingPeriod: "lifetime",
    

    features: {
      resumeTemplates: "limited",
      ats: "none",
      aiInterview: "trial",
      jobs: "limited",
      applications: 0,
      autoApply: false,
    },
  },

  BASIC: {
    name: "Basic",
    price: 79,
    billingPeriod: "monthly",
    razorpayPlanId: "plan_TX0ZaQfqzgmtYZ",

    features: {
      resumeTemplates: "limited",
      ats: "limited",
      aiInterview: "trial",
      jobs: "limited",
      applications: 2,
      autoApply: false,
    },
  },

  PRO: {
    name: "Pro",
    price: 199,
    billingPeriod: "monthly",
    razorpayPlanId: "plan_TX0bkg9FAGoZ5t",

    features: {
      resumeTemplates: "more",
      ats: "full",
      aiInterview: "full",
      jobs: "full",
      applications: "unlimited",
      autoApply: false,
    },
  },

  PREMIUM: {
    name: "Premium",
    price: 499,
    billingPeriod: "yearly",
    razorpayPlanId: "plan_TX0dx0yM5L3p01",

    features: {
      resumeTemplates: "all",
      ats: "full",
      aiInterview: "full",
      jobs: "full",
      applications: "unlimited",
      autoApply: true,
    },
  },
};

module.exports = PLANS;