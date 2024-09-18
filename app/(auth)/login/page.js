import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {LoginForm} from "@/components/auth";
import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";

export default async function Page() {
    const { session } = await validateRequest();
    if (session) redirect("/dashboard");

    return (
        <Card className="mx-auto w-full max-w-[450px]">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm/>
            </CardContent>
        </Card>
    )
}
