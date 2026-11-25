export default {
  async redirects() {
    return [{ source: "/admin", destination: "/photo-management", permanent: false }];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/styling-table" }],
    };
  },
};
