import {logout} from "@/actions/auth";
import {Button} from "@/components/ui/button";

export default async function LogoutForm() {
    return (
        <form action={logout}>
            <Button type="submit">Sign out</Button>
        </form>
    );
}
