import {validateRequest} from "@/actions/auth";
import Link from "next/link";
import {LogoutForm} from "@/components/auth";

export default async function Header() {
    const {session} = await validateRequest();


    return (
        <nav className="flex justify-end py-4 px-6">
            <ul className="flex items-center gap-x-6">
                {session ? (
                    <>
                        <li>
                            <Link href={`/dashboard`}>
                                Dashboard
                            </Link>
                        </li>
                        <LogoutForm />
                    </>
                ) : (
                    <>
                        <li>
                            <Link href={`/`}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href={`/login`}>
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link href={`/register`}>
                                Register
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    )
}
