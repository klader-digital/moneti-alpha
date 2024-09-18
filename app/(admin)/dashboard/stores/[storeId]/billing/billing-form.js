"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { cn, formatDate } from "@/lib/utils";
import {toast} from "@/hooks/use-toast";

export function BillingForm({storeId, subscriptionPlan, className, ...props}) {
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event) {
        event.preventDefault();
        setIsLoading(!isLoading);

        // Get a Stripe session URL.
        const response = await fetch(`/api/stripe?storeId=${storeId}`, {method: "GET"});

        if (!response?.ok) {
            return toast({
                title: "Something went wrong.",
                description: "Please refresh the page and try again.",
                variant: "destructive",
            });
        }

        // Redirect to the Stripe session.
        // This could be a checkout page for initial upgrade.
        // Or portal to manage existing subscription.
        const session = await response.json();
        if (session) {
            window.location.href = session.url;
        }
    }

    return (
        <form className={cn(className)} onSubmit={onSubmit} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                        You&apos;re currently on the <strong>{subscriptionPlan.name}</strong> plan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="font-medium ">
                    {subscriptionPlan.description}
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                    <Button type="submit" disabled={isLoading}>
                        {subscriptionPlan.isPro ? "Manage Subscription" : "Upgrade to PRO"}
                    </Button>
                    {subscriptionPlan.isPro ? (
                        <p className="rounded-full text-xs font-medium md:self-end ">
                            {subscriptionPlan.isCanceled
                                ? "Your plan will be canceled on "
                                : "Your plan renews on "}
                            {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}.
                        </p>
                    ) : null}
                </CardFooter>
            </Card>
        </form>
    );
}
