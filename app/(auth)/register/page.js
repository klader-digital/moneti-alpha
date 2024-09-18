import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {RegisterForm} from "@/components/auth";
import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";

export default async function Page() {
    const { session } = await validateRequest();
    if (session) redirect("/dashboard");

    return (
        <Card className="mx-auto w-full max-w-[450px]">
            <CardHeader>
                <CardTitle className="text-2xl">Register</CardTitle>
                <CardDescription>
                    Enter your email below to register an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RegisterForm/>
            </CardContent>
        </Card>
    )
}
