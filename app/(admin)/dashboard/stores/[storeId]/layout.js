import Link from 'next/link'

export default async function DashboardLayout({children, params}) {
    const {storeId} = params;
    return (
        <>
            <nav className="border p-4 my-4">
                <ul className="flex items-center gap-x-6">
                    <li><Link href={`/dashboard/stores/${storeId}/`}>Dashboard</Link></li>
                    <li><Link href={`/dashboard/stores/${storeId}/products`}>Products</Link></li>
                    <li><Link href={`/dashboard/stores/${storeId}/billing`}>Billing</Link></li>
                    <li><Link href={`/dashboard/stores/${storeId}/settings`}>Settings</Link></li>
                </ul>
            </nav>
            <div className="px-4">
                {children}
            </div>
        </>
    )
}
