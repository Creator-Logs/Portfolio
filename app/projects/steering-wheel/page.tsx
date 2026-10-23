// FSAE steering wheel, built per docs/portfolio/projects/fsae-steering-wheel.md ("Page plan v2").
import type { Metadata } from "next";
import { NextProject } from "@/components/project/NextProject";
import { MakingIt } from "@/components/steering/MakingIt";
import { ProvingIt } from "@/components/steering/ProvingIt";
import { ShapedByHands } from "@/components/steering/ShapedByHands";
import { StackUp } from "@/components/steering/StackUp";
import { WheelBrief } from "@/components/steering/WheelBrief";
import { WheelHero } from "@/components/steering/WheelHero";
import { WhereItLanded } from "@/components/steering/WhereItLanded";

export const metadata: Metadata = {
  title: "Steering Wheel · Ansh Gupta",
  description:
    "The Illini Electric Motorsports Formula SAE steering wheel: carbon-fiber baseplate, SLS enclosure, driver-sculpted grips and CNC-milled standoffs, sized by hand calcs and Ansys FEA for 180 lbf push/pull and 600 lbf·in torque.",
};

export default function SteeringWheelPage() {
  return (
    <main>
      <WheelHero />
      <WheelBrief />
      <StackUp />
      <ProvingIt />
      <ShapedByHands />
      <MakingIt />
      <WhereItLanded />
      <NextProject slug="3d-printer" />
    </main>
  );
}
