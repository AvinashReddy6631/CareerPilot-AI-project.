import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { openRazorpayCheckout } from "../../services/paymentService";

import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  Crown,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

const PLANS = [
  {
    name: "Free",
    planKey: "FREE",
    price: "₹0",
    period: "Forever",
    description:
      "Everything you need to start building your career journey.",
    features: [
      "Resume Builder",
      "Career Roadmap",
      "ATS Analysis: Not included",
      "1 AI Interview lifetime",
      "3–4 selected jobs",
      "Application Tracker",
    ],
    action: "Continue Free",
    icon: Sparkles,
    tone: "slate",
  },

  {
    name: "Basic",
    planKey: "BASIC",
    price: "₹79",
    period: "/ Month",
    description:
      "Essential AI-powered tools for a focused job search.",
    features: [
      "Resume Builder",
      "Limited ATS Analysis",
      "1 AI Interview lifetime",
      "3–4 selected jobs",
      "Apply to 2 jobs/month",
      "No Auto Apply",
    ],
    action: "Start Basic",
    icon: Sparkles,
    tone: "violet",
    badge: "Best Start",
  },

  {
    name: "Pro",
    planKey: "PRO",
    price: "₹199",
    period: "/ Month",
    description:
      "The complete system for a confident and unlimited job search.",
    badge: "Most Popular",
    features: [
      "More Resume Templates",
      "Full ATS Analysis",
      "Unlimited AI Interviews",
      "Full Job Discovery",
      "Unlimited Applications",
      "Resume Versions",
      "Interview Reports",
      "No Auto Apply",
    ],
    action: "Upgrade Now",
    icon: Crown,
    tone: "brand",
    featured: true,
  },

  {
    name: "Premium",
    planKey: "PREMIUM",
    price: "₹499",
    period: "/ Year",
    description:
      "Everything you need for placement readiness and automated job applications.",
    badge: "Best Value",
    features: [
      "All Resume Templates",
      "Full ATS Analysis",
      "Unlimited AI Interviews",
      "Full Job Discovery",
      "Unlimited Applications",
      "Everything in Pro",
      "Auto Apply",
    ],
    action: "Go Premium",
    icon: Rocket,
    tone: "amber",
  },
];

const COMPARISON_ROWS = [
  [
    "Resume Builder",
    "Included",
    "Included",
    "Included",
    "Included",
  ],
  [
    "Resume Templates",
    "Limited",
    "Limited",
    "More",
    "All",
  ],
  [
    "ATS Analysis",
    "None",
    "Limited",
    "Full",
    "Full",
  ],
  [
    "AI Interviews",
    "1 lifetime",
    "1 lifetime",
    "Unlimited",
    "Unlimited",
  ],
  [
    "Job Discovery",
    "3–4 selected",
    "3–4 selected",
    "Full",
    "Full",
  ],
  [
    "Applications",
    "0",
    "2/month",
    "Unlimited",
    "Unlimited",
  ],
  [
    "Resume Rewriter",
    "—",
    "—",
    "Included",
    "Included",
  ],
  [
    "Resume Versions",
    "—",
    "—",
    "Included",
    "Included",
  ],
  [
    "Interview Reports",
    "—",
    "—",
    "Included",
    "Included",
  ],
  [
    "Auto Apply",
    "—",
    "—",
    "—",
    "Included",
  ],
];

const FAQS = [
  {
    question: "Can I continue using CareerPilot for free?",
    answer:
      "Yes. The Free plan remains available and includes the core tools needed to start building your career journey.",
  },

  {
    question: "What is included in the Basic plan?",
    answer:
      "Basic costs ₹79 per month and includes limited ATS analysis, one lifetime AI interview, selected job discovery, and up to 2 job applications per billing month.",
  },

  {
    question: "What do I get with the Pro plan?",
    answer:
      "Pro costs ₹199 per month and unlocks full ATS analysis, unlimited AI interviews, full job discovery, unlimited applications, more resume templates, resume versions, and interview reports.",
  },

  {
    question: "What is included in Premium?",
    answer:
      "Premium costs ₹499 per year and includes everything in Pro plus all resume templates and Auto Apply.",
  },

  {
    question: "Are payments secure?",
    answer:
      "Yes. CareerPilot uses Razorpay for subscription payments. Payment verification is performed securely on the backend before subscription access is activated.",
  },

  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes. Subscription cancellation and billing lifecycle management will be handled through the subscription system.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The interview practice gave me a calm, repeatable way to prepare for every round.",
    name: "Aarav Mehta",
    role: "Final-year engineering student",
    initials: "AM",
  },

  {
    quote:
      "CareerPilot turned a scattered job search into a clear plan I could actually follow.",
    name: "Priya Nair",
    role: "Aspiring product designer",
    initials: "PN",
  },

  {
    quote:
      "The ATS guidance helped me make my resume clearer, sharper, and far more confident.",
    name: "Rohan Shah",
    role: "Software engineering graduate",
    initials: "RS",
  },
];

function PlanCard({ plan, onSelect, isProcessing }) {
  const Icon = plan.icon;
  const paidPlan = plan.planKey !== "FREE";

  return (
    <motion.article
      layout
      whileHover={{ y: -5 }}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 28,
      }}
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow sm:p-6 ${
        plan.featured
          ? "border-brand-400 bg-gradient-to-b from-brand-50 via-white to-white shadow-xl shadow-brand-500/15 dark:border-brand-500/70 dark:from-brand-500/15 dark:via-slate-900 dark:to-slate-900"
          : "border-slate-200/90 bg-white/85 dark:border-slate-700/80 dark:bg-slate-900/80"
      }`}
    >
      {plan.featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-brand-500" />
      )}

      <div className="flex min-h-8 items-center justify-between gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            plan.featured
              ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Icon
            className="h-4 w-4"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </span>

        {plan.badge && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] ${
              plan.featured
                ? "bg-brand-600 text-white"
                : plan.tone === "amber"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"
            }`}
          >
            {plan.planKey === "BASIC"
              ? "✨ "
              : plan.planKey === "PRO"
                ? "⭐ "
                : "🚀 "}
            {plan.badge}
          </span>
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
          {plan.name}
        </h3>

        <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {plan.description}
        </p>
      </div>

      <div className="mt-5 flex items-end gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          {plan.price}
        </span>

        <span className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {plan.period}
        </span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2.5 text-sm leading-5 text-slate-600 dark:text-slate-300"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400"
              strokeWidth={2.5}
              aria-hidden="true"
            />

            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isProcessing}
        onClick={() => onSelect(plan)}
        className={`mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-900 ${
          plan.featured
            ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-500/25 hover:brightness-110"
            : paidPlan
              ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              : "border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
        }`}
      >
        {isProcessing ? "Opening..." : plan.action}

        {paidPlan && !isProcessing && (
          <ArrowRight className="h-4 w-4" />
        )}
      </button>
    </motion.article>
  );
}

export default function PricingModal({ isOpen, onClose }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const closePricing = () => {
    setProcessingPlan(null);
    onClose();
  };

  const handlePlanSelect = async (plan) => {
    // FREE PLAN
    if (plan.planKey === "FREE") {
      closePricing();
      return;
    }

    try {
      setProcessingPlan(plan.planKey);

      // Razorpay subscription checkout
      await openRazorpayCheckout(plan.planKey);
    } catch (error) {
      console.error("Razorpay checkout error:", error);

      alert(
        error?.message ||
          "Unable to start payment. Please try again."
      );

      setProcessingPlan(null);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-md sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePricing();
            }
          }}
          role="presentation"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-modal-title"
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 14,
              scale: 0.985,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-slate-50 shadow-2xl shadow-slate-950/35 dark:border-slate-700 dark:bg-slate-950 sm:max-h-[calc(100dvh-2.5rem)]"
          >
            <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.28),transparent_65%)]" />

            <div className="relative flex items-center justify-end px-4 pt-4 sm:px-6 sm:pt-5">
              <button
                type="button"
                onClick={closePricing}
                className="rounded-xl border border-slate-200/80 bg-white/80 p-2 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close pricing modal"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="relative min-h-0 overflow-y-auto px-4 pb-6 sm:px-7 sm:pb-8 lg:px-10">
              <header className="mx-auto max-w-2xl pb-8 pt-1 text-center sm:pb-10">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/75 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur dark:border-brand-500/20 dark:bg-slate-900/75 dark:text-brand-300">
                  <ShieldCheck
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  Secure Plans
                </div>

                <h2
                  id="pricing-modal-title"
                  className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl"
                >
                  ✨ CareerPilot Pro
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                  Choose the plan that matches your career goals and
                  prepare for placements faster.
                </p>
              </header>

              {/* PRICING CARDS */}
              <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
                {PLANS.map((plan) => (
                  <PlanCard
                    key={plan.planKey}
                    plan={plan}
                    onSelect={handlePlanSelect}
                    isProcessing={
                      processingPlan === plan.planKey
                    }
                  />
                ))}
              </div>

              {/* COMPARISON */}
              <section
                className="mt-12"
                aria-labelledby="comparison-title"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                      Choose with confidence
                    </p>

                    <h3
                      id="comparison-title"
                      className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white"
                    >
                      Feature comparison
                    </h3>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Every plan is built around better career outcomes.
                  </p>
                </div>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-4">
                          Feature
                        </th>

                        {PLANS.map((plan) => (
                          <th
                            key={plan.planKey}
                            className="px-4 py-4"
                          >
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {COMPARISON_ROWS.map(
                        ([feature, ...values]) => (
                          <tr
                            key={feature}
                            className="text-slate-600 dark:text-slate-300"
                          >
                            <th
                              scope="row"
                              className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100"
                            >
                              {feature}
                            </th>

                            {values.map((value, index) => (
                              <td
                                key={`${feature}-${PLANS[index].planKey}`}
                                className={`px-4 py-3.5 ${
                                  index === 2
                                    ? "font-semibold text-brand-700 dark:text-brand-300"
                                    : ""
                                }`}
                              >
                                {value === "Included" ? (
                                  <CircleCheck
                                    className="h-4 w-4 text-brand-600 dark:text-brand-400"
                                    aria-label="Included"
                                  />
                                ) : (
                                  value
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* FAQ + TESTIMONIALS */}
              <section
                className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"
                aria-label="Frequently asked questions and student testimonials"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                    Everything you need to know
                  </p>

                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                    Frequently asked questions
                  </h3>

                  <div className="mt-5 space-y-2">
                    {FAQS.map((faq, index) => {
                      const isExpanded = openFaq === index;

                      return (
                        <div
                          key={faq.question}
                          className="rounded-xl border border-slate-200/90 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFaq(
                                isExpanded ? -1 : index
                              )
                            }
                            aria-expanded={isExpanded}
                            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition-colors hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
                          >
                            {faq.question}

                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                                isExpanded
                                  ? "rotate-180"
                                  : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: 0.2,
                                }}
                                className="overflow-hidden"
                              >
                                <p className="px-4 pb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                    Loved by learners
                  </p>

                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                    Built for the next opportunity
                  </h3>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {TESTIMONIALS.map((testimonial) => (
                      <article
                        key={testimonial.name}
                        className="rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                      >
                        <Star
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />

                        <blockquote className="mt-3 text-sm leading-5 text-slate-600 dark:text-slate-300">
                          “{testimonial.quote}”
                        </blockquote>

                        <div className="mt-4 flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-[9px] font-bold text-white">
                            {testimonial.initials}
                          </span>

                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {testimonial.name}
                            </p>

                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              {/* FOOTER */}
              <footer className="mt-10 flex flex-col items-center justify-center gap-2 border-t border-slate-200/80 pt-6 text-center dark:border-slate-800">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <LockKeyhole
                    className="h-4 w-4 text-brand-600 dark:text-brand-400"
                    aria-hidden="true"
                  />
                  Secure Payments
                </span>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payments are securely processed through Razorpay.
                </p>
              </footer>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}