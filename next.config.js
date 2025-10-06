/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // SWC 최적화 설정
  compiler: {
    // SWC 컴파일러 옵션
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // 성능 최적화 (critters 문제로 비활성화)
    // optimizeCss: true,
    optimizePackageImports: ['react-icons'],
  },
  webpack: (config, { isServer, dev }) => {
    // SVG 처리
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    // 웹팩 최적화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // 번들 크기 최적화 (프로덕션에만 적용)
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
