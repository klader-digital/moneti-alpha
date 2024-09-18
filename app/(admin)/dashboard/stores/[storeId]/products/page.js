import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";
import {GET_STORE_BY_USER_ID_AND_STORE_ID} from "@/app/(admin)/dashboard/stores/actions";

export default async function Page({params}) {
    const {user} = await validateRequest();
    if (!user) redirect('/login');

    const {storeId} = params;
    const store = await GET_STORE_BY_USER_ID_AND_STORE_ID(user.id, storeId, {products: true});

    if (!store) redirect('/dashboard');

    return (
        <main>

            {store.products.map(product => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                </div>
            ))}
        </main>
    )
}
