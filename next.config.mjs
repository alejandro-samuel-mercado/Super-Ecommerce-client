
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
  
};

export default nextConfig;
