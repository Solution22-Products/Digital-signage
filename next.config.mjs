/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'localhost',
                pathname: '/images/**',
                
            },
            {
                protocol: 'https',
                hostname: 'uxtdqbyjhvylecoctitq.supabase.co',
                pathname: '/**',
              },
            {
                protocol: 'https',
                hostname: 'uxtdqbyjhvylecoctitq.supabase.co',
                pathname: '/userProfile/**',
              },
        ]
    }
};

export default nextConfig;
