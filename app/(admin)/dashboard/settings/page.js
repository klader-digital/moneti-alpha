import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) redirect('/login');

    return (
        <main>
            <h1>Settings</h1>
        </main>
    )
}
