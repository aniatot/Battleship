import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({
  allowedDevOrigins: ['192.168.1.17', 'localhost', '0.0.0.0']
} as any);
