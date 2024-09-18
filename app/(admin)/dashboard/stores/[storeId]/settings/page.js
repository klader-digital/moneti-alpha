import {validateRequest} from "@/actions/auth";
import {redirect} from "next/navigation";
import {GET_STORE_BY_USER_ID_AND_STORE_ID} from "./../../actions";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import UpdateStoreForm from "./../../update-store-form";

export default async function Page({params}) {
    const {user} = await validateRequest();
    if (!user) redirect('/login');

    const {storeId} = params;
    const store = await GET_STORE_BY_USER_ID_AND_STORE_ID(user.id, storeId);

    if (!store) redirect('/dashboard');

    return (
        <main>
            <Card>
                <CardHeader>
                    <CardTitle>Update Store</CardTitle>
                    <CardDescription>
                        Update your store settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateStoreForm store={store} />
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Delete Store</CardTitle>
                    <CardDescription>
                        Delete your store permanently
                    </CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>
        </main>
    )
}
