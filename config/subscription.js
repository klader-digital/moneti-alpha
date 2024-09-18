export const freePlan = {
    name: "Free",
    description: "Limited features. Upgrade to unlock all features.",
    stripePriceId: "",
};

export const proPlan = {
    name: "PRO",
    description: "All features are unlocked. Enjoy the full experience.",
    stripePriceId: process.env.STRIPE_PRO_PLAN_ID,
};
