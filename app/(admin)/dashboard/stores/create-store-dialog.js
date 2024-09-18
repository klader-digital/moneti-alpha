"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {toast} from "@/hooks/use-toast";
import {Checkbox} from "@/components/ui/checkbox";
import {CREATE_STORE} from "./actions";

const storeSchema = z.object({
    webflowApiKey: z.string().min(1, "Please enter a valid Webflow API key"),
    stripeSecretLiveKey: z.string().optional(),
    enableStripeTestMode: z.boolean().optional(),
    stripeSecretTestKey: z.string().optional(),
});

export default function CreateStoreDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            webflowApiKey: "",
            stripeSecretLiveKey: "",
            enableStripeTestMode: false,
            stripeSecretTestKey: "",
        },
    });

    async function onSubmit(values) {
        try {
            await CREATE_STORE(values);

            toast({
                title: "Store created successfully.",
            });
            form.reset();
            setIsOpen(false);
        } catch (error) {
            console.error({error});
            return toast({
                title: "Error creating project. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card
                    role="button"
                    className="flex flex-col items-center justify-center gap-y-2.5 p-8 text-center hover:bg-accent"
                >
                    <Button size="icon" variant="ghost">
                        +
                    </Button>
                    <p className="text-xl font-medium ">Create a project</p>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Store</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="webflowApiKey"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Webflow API Key</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your Webflow API key" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        <p className="text-xs uppercase font-bold">Required scope:</p>
                                        <pre className="text-xs text-lime-600">ecommerce:read, cms:read, sites:read, sites:write</pre>
                                    </FormDescription>
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
                            render={({ field }) => (
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

                        <DialogFooter>
                            <Button disabled={form.formState.isSubmitting} type="submit">
                                {form.formState.isSubmitting ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
