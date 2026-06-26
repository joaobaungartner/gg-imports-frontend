import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <AuthProvider>
      <Layout>
        <Outlet />
      </Layout>
    </AuthProvider>
  );
}
