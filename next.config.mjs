/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: async () => {
        return [
            {
                source: '/dashboard',
                destination: '/dashboard/stores',
                permanent: true,
            },
        ];
    },
    experimental: {
        serverComponentsExternalPackages: ["@node-rs/argon2"]
    }
};

export default nextConfig;
