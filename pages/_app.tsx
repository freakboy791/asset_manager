// pages/_app.tsx
import { AppProps } from "next/app";
import "../styles/globals.css";
import { useRouter } from "next/router";
import SiteLayout from "../components/SiteLayout";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = ["/", "/auth/reset"].includes(router.pathname);

  const Layout = isAuthPage ? ({ children }: { children: React.ReactNode }) => <>{children}</> : SiteLayout;

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}