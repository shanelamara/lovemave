export default {
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/styling-table" }],
    };
  },
};
