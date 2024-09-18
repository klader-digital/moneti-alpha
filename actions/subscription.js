import prisma from "@/lib/prisma";
import {freePlan, proPlan} from "@/config/subscription";

export async function GET_STORE_SUBSCRIPTION_PLAN(storeId) {
    const store = await prisma.store.findFirst({
        where: {
            id: storeId,
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
        },
    });

    if (!store) {
        throw new Error("Store not found");
    }

    // Check if user is on a pro plan.
    const isPro = Boolean(
        store.stripePriceId &&
        store.stripeCurrentPeriodEnd && // Ensure stripeCurrentPeriodEnd is not null or undefined
        store.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    );
    const plan = isPro ? proPlan : freePlan;

    return {
        ...plan,
        ...store,
        stripeCurrentPeriodEnd: store.stripeCurrentPeriodEnd ? store.stripeCurrentPeriodEnd.getTime() : undefined,
        isPro,
        stripePriceId: store.stripePriceId || "",
    };
}
