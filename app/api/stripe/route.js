import { z } from "zod";
import { validateRequest } from "@/actions/auth";
import { proPlan } from "@/config/subscription";
import { stripe } from "@/lib/stripe";
import {GET_STORE_SUBSCRIPTION_PLAN} from "@/actions/subscription";

export async function GET(req) {
    const url = new URL(req.nextUrl);
    const searchParams = url.searchParams;
    const storeId = searchParams.get("storeId");

    if (!storeId) {
        return new Response("Invalid store ID", { status: 400 });
    }

    const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stores/${storeId}/billing`;

    try {

        const { user, session } = await validateRequest();

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const subscriptionPlan = await GET_STORE_SUBSCRIPTION_PLAN(storeId);

        // The user is on the pro plan.
        // Create a portal session to manage subscription.
        if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: subscriptionPlan.stripeCustomerId,
                return_url: billingUrl,
            });
            return Response.json({ url: stripeSession.url });
        }

        // The user is on the free plan.
        // Create a checkout session to upgrade.
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.email,
            line_items: [
                {
                    price: proPlan.stripePriceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                storeId: storeId,
            },
        });

        return new Response(JSON.stringify({ url: stripeSession.url }));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 });
        }

        return new Response(null, { status: 500 });
    }
}
