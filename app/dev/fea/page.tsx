// Dev-only preview of the steering-wheel FEA viewer until the project page is built.
//   /dev/fea
import { notFound } from "next/navigation";
import { ChapterHeader } from "@/components/ui/ChapterHeader";
import { FeaViewer } from "@/components/steering/FeaViewer";

export default function FeaPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="px-page flex min-h-svh flex-col gap-10 py-28">
      <ChapterHeader number="02" eyebrow="Proving it" lines={["Pushed, pulled,", "twisted."]} accentLast />
      <FeaViewer />
      <div className="h-[50svh]" />
    </main>
  );
}
