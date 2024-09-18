"use client";

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {register} from "@/actions/auth";
import {useToast} from "@/hooks/use-toast";
import Link from "next/link";

const userAuthSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
});

export default function RegisterForm() {
    const { toast } = useToast()
    const form = useForm({
        resolver: zodResolver(userAuthSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values) {
        try {
            const res = await register(values);
            if (res) {
                toast({
                    title: "Success",
                    description: "You have successfully registered",
                    status: "success",
                });
            }
        } catch (error) {
            toast({
                title: "An error occurred",
                description: error.message,
                status: "error",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                >
                    Register
                </Button>

                <Button variant="outline" className="w-full">
                    Register with Google
                </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href={"/login"} className="underline">
                    Login
                </Link>
            </div>
        </Form>
    )
}
