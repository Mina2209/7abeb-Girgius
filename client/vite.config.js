import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
// This config supports an optional `VITE_PROXY_TARGET` environment variable
// so you can point the Vite dev proxy to a remote backend (e.g. Elastic Beanstalk)
export default defineConfig(({ mode }) => {
  // load env variables (from client/.env, .env.local, etc.) for this mode
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          // enable secure only when target is https
          secure: proxyTarget.startsWith('https'),
        },
      },
    },
  };
});
