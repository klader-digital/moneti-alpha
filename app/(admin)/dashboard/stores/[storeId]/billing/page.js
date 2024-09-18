import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";
import {GET_STORE_BY_USER_ID_AND_STORE_ID} from "./../../actions";
import {GET_STORE_SUBSCRIPTION_PLAN} from "@/actions/subscription";
import {stripe} from "@/lib/stripe";
import {BillingForm} from "./billing-form";

export default async function Page({params}) {
    const {user} = await validateRequest();
    if (!user) redirect('/login');

    const {storeId} = params;
    const store = await GET_STORE_BY_USER_ID_AND_STORE_ID(user.id, storeId);

    if (!store) redirect('/dashboard');

    const subscriptionPlan = await GET_STORE_SUBSCRIPTION_PLAN(storeId);

    let isCanceled = false;
    if (subscriptionPlan.isPro && subscriptionPlan.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(
            subscriptionPlan.stripeSubscriptionId
        );
        isCanceled = stripePlan.cancel_at_period_end;
    }

    return (
        <main>
            <BillingForm
                storeId={params.storeId}
                subscriptionPlan={{
                    ...subscriptionPlan,
                    isCanceled,
                }}
            />
        </main>
    )
}
