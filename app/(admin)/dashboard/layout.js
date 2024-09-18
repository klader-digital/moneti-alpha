import Link from 'next/link'

export default async function DashboardLayout({children}) {
    return (
        <>
            <nav className="border p-4">
                <ul className="flex items-center gap-x-6">
                    <li><Link href={'/dashboard/stores'}>Dashboard</Link></li>
                    <li><Link href={'/dashboard/settings'}>Settings</Link></li>
                </ul>
            </nav>
            <div className="px-4 my-4">
                {children}
            </div>
        </>
    )
}
