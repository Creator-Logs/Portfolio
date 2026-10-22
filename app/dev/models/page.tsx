// Dev-only model QA page (Phase 3): renders one GLB from a fixed camera so the pipeline's
// output can be screenshot and pixel-diffed against its uncompressed source.
//   /dev/models?src=/models/steering-wheel/steering-wheel.glb&view=0
import { notFound } from "next/navigation";
import { ModelQA } from "@/components/dev/ModelQA";

export default async function ModelQAPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { src = "", view = "0", env = "dark-studio" } = await searchParams;
  return <ModelQA src={src} view={Number(view)} env={env === "light-studio" ? "light-studio" : "dark-studio"} />;
}
