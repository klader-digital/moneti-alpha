import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";
import Link from "next/link";
import CreateStoreDialog from "./create-store-dialog";
import {GET_STORES_BY_USER_ID} from "./actions";
import {Card} from "@/components/ui/card";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) redirect('/login');

    const stores = await GET_STORES_BY_USER_ID(user.id);

    return (
        <main>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 ">
                <CreateStoreDialog/>
                {stores.map((store) => (
                    <Card
                        role="button"
                        key={store.id}
                        className="relative flex flex-col items-center justify-center gap-y-2.5 p-8 text-center hover:bg-accent"
                    >
                        <h4 className="font-medium">{store.name}</h4>
                        <Link
                            href={`/dashboard/stores/${store.id}`}
                            className="absolute inset-0 "
                        >
                            <span className="sr-only">View store details</span>
                        </Link>
                    </Card>
                ))}
            </div>
        </main>
    )
}
