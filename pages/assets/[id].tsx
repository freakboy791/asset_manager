import { useRouter } from "next/router";

export default function AssetTest() {
  const { id } = useRouter().query as { id?: string };
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-2">Asset Route Test</h1>
      <div>id: <code>{id}</code></div>
    </main>
  );
}
