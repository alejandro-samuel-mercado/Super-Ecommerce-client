
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "**",
            },
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                pathname: "**",
            },
        ],


        unoptimized: true,
    },
    output: 'export',
};

export default nextConfig;
