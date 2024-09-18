import {headers} from "next/headers";
import {buffer} from "node:stream/consumers";
import {stripe} from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req) {
    //@ts-expect-error Argument of type 'ReadableStream<any>' is not assignable to parameter of type 'ReadableStream | Readable | AsyncIterable<any>'
    const body = await buffer(req.body);
    const signature = headers().get("Stripe-Signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        if (error instanceof Error) {
            return new Response(`Webhook Error: ${error.message}`, {status: 400});
        }
    }

    const session = event?.data.object

    if (event?.type === "checkout.session.completed") {
        // Retrieve the subscription details from Stripe.
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription
        );

        // Update the user stripe into in our database.
        // Since this is the initial subscription, we need to update
        // the subscription id and customer id.
        await prisma.store.update({
            where: {
                id: session?.metadata?.storeId,
                userId: session?.metadata?.userId,
            },
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
            },
        });
    }

    if (event?.type === "invoice.payment_succeeded") {
        // Retrieve the subscription details from Stripe.
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription
        );

        // Update the price id and set the new period end.
        await prisma.store.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
            },
        });
    }

    return new Response(null, {status: 200});
}
