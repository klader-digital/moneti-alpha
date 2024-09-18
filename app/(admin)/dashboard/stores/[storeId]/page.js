import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";
import {GET_STORE_BY_USER_ID_AND_STORE_ID} from "./../actions";

export default async function Page({params}) {
    const {user} = await validateRequest();
    if (!user) redirect('/login');

    const {storeId} = params;

    const store = await GET_STORE_BY_USER_ID_AND_STORE_ID(user.id, storeId);
    if (!store) redirect('/dashboard');

    return (
        <main>
            <h1>{store.name}</h1>
        </main>
    )
}



