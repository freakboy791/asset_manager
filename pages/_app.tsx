// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import SiteLayout from "@/components/SiteLayout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <SiteLayout pathname={router.pathname}>
      <Component {...pageProps} />
    </SiteLayout>
  );
}
