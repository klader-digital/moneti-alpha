'use client';

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {UPDATE_STORE} from "./actions";
import {toast} from "@/hooks/use-toast";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";

const storeSchema = z.object({
    webflowApiKey: z.string().min(1, "Please enter a valid Webflow API key"),
    stripeSecretLiveKey: z.string().optional(),
    enableStripeTestMode: z.boolean().optional(),
    stripeSecretTestKey: z.string().optional(),
});

export default function UpdateStoreForm({store}) {
    const form = useForm({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            webflowApiKey: store.webflowApiKey ?? "",
            stripeSecretLiveKey: store.stripeSecretLiveKey ?? "",
            enableStripeTestMode: store.enableStripeTestMode ?? false,
            stripeSecretTestKey: store.stripeSecretTestKey ?? "",
        },
    });

    async function onSubmit(values) {
        try {
            await UPDATE_STORE(values, store.id);

            toast({
                title: "Store created successfully.",
            });
            // form.reset();
        } catch (error) {
            console.error({error});
            return toast({
                title: "Error creating project. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="webflowApiKey"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Webflow API Key</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your Webflow API key" {...field} readOnly disabled />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="stripeSecretLiveKey"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Stripe Secret Key</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your Stripe secret live key" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="enableStripeTestMode"
                    render={({field}) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel>
                                Enable Stripe test mode
                            </FormLabel>
                        </FormItem>
                    )}
                />

                {form.watch("enableStripeTestMode") && (
                    <FormField
                        control={form.control}
                        name="stripeSecretTestKey"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Stripe Test Key</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your Stripe test key" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )}

                <Button disabled={form.formState.isSubmitting} type="submit">
                    {form.formState.isSubmitting ? "Updating..." : "Update"}
                </Button>
            </form>
        </Form>
    )
}
