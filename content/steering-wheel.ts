// Copy + part data for /projects/steering-wheel (docs/portfolio/projects/fsae-steering-wheel.md, "Page plan v2").
// Facts come from Ansh_Gupta_Engineering_Resume_.pdf, Ansh's answers in the page file, the CAD (part groups in
// scripts/models/steering-wheel-parts.json) and the Ansys solve (content/fea) — never invent numbers.

const MEDIA = "/project_media/steering-wheel";

export const hero = {
  eyebrow: "Formula SAE Electric · Illini Electric Motorsports",
  role: "Project lead · Cockpit · Aug 2025 – Apr 2026",
  tools: [
    { name: "PTC Creo", logo: "/logos/Creo.svg" },
    { name: "Ansys", logo: "/logos/Ansys.svg" },
    { name: "CNC mill" },
    { name: "Waterjet" },
    { name: "SLS" },
    { name: "3D scan" },
  ],
};

export const brief = {
  goal:
    "I owned the mechanical design of the team's steering wheel in PTC Creo: a carbon-fiber baseplate, SLS enclosure and front panel, gaskets, ergonomic grips, and the quick-disconnect standoffs that carry the load into the column, all packaged around the electronics with the electrical team.",
  requirements: [
    { label: "180 lbf push / pull", note: "The driver pushing and pulling on the wheel under braking" },
    { label: "600 lbf·in torque", note: "Steering torque, carried from the plate into the hub" },
    { label: "Quick-disconnect", note: "The wheel comes off the column on a Lifeline QD hub" },
    { label: "Waterproof enclosure", note: "Gaskets on both faces of the electronics enclosure" },
    { label: "Electronics packaged with the electrical team", note: "Their board lives inside the wheel" },
  ],
};

/** One row per exploded-view group (ids = node names in steering-wheel-parts.glb), driver side first. */
export type Part = { ids: string[]; name: string; spec: string; note: string };

export const parts: Part[] = [
  {
    ids: ["controls"],
    name: "Controls",
    spec: "Rotary encoders · dials · knobs",
    note: "I specified the encoder O-ring fits that seal the shafts.",
  },
  {
    ids: ["front_panel"],
    name: "Front panel",
    spec: "SLS · polycarbonate window",
    note: "The driver-facing panel that holds the controls.",
  },
  {
    ids: ["front_gasket"],
    name: "Front-panel gasket",
    spec: "Gasket · FDM-prototyped",
    note: "Seals the front panel to the plate. Gasket design was iterated through FDM prototypes.",
  },
  {
    ids: ["hub_bolts"],
    name: "Hub bolts",
    spec: "3 × NAS 6203",
    note: "Clamp the plate and both standoffs to the hub.",
  },
  {
    ids: ["grip_left", "grip_right"],
    name: "Grips",
    spec: "Driver-sculpted · 3D-scanned",
    note: "Shaped by the driver in clay, scanned, and refined in CAD (chapter 03).",
  },
  {
    ids: ["base_plate"],
    name: "Baseplate",
    spec: "20-ply carbon fiber · waterjet-cut",
    note: "Everything mounts to it. Pilot holes keep the waterjet from delaminating the plies.",
  },
  {
    ids: ["enclosure_gasket"],
    name: "Enclosure gasket",
    spec: "Gasket · FDM-prototyped",
    note: "Seals the enclosure against the back of the plate.",
  },
  {
    ids: ["standoff"],
    name: "Standoff",
    spec: "7075-T6 aluminium · CNC-milled",
    note: "First of two standoffs that carry torque and push/pull from the plate into the hub.",
  },
  {
    ids: ["pcb"],
    name: "Steering-wheel board",
    spec: "Electrical team",
    note: "Sandwiched between the two standoffs. It's the decision I'd change.",
  },
  {
    ids: ["tri_standoff"],
    name: "Tri-standoff",
    spec: "7075-T6 aluminium · CNC-milled",
    note: "Triangular second standoff on the hub's three-bolt pattern.",
  },
  {
    ids: ["enclosure"],
    name: "Enclosure",
    spec: "SLS · PA 66 GF",
    note: "Houses the electronics behind the plate.",
  },
  {
    ids: ["qd_gasket"],
    name: "QD gasket",
    spec: "Gasket",
    note: "Seals the enclosure where the hub comes through.",
  },
  {
    ids: ["qd"],
    name: "Quick-disconnect",
    spec: "Lifeline QD · gold anodised",
    note: "Lets the wheel come off the column. The fixed support in the FEA.",
  },
];

export const stackUp = {
  lines: ["Built around", "the plate."],
  body:
    "Everything bolts to the carbon plate. The controls and front panel sit on the driver's side; behind it, the enclosure houses the electrical team's board, and two aluminium standoffs carry steering torque and push/pull from the plate into the quick-disconnect.",
};

export const provingIt = {
  lines: ["Pushed, pulled,", "twisted."],
  body:
    "I sized the standoffs for steering torque and braking push/pull with free-body diagrams, hand calcs and Ansys FEA: a minimum factor of safety of 3.7 at 180 lbf axial and 600 lbf·in torque.",
  feaIntro:
    "The solved Ansys model, with its real per-node stress: 180 lbf axial and 600 lbf·in torque on the plate, fixed at the quick-disconnect. Drag to turn it.",
};

export const grips = {
  lines: ["Shaped by", "hands."],
  body:
    "The grips started as clay: the driver sculpted them by hand, I 3D-scanned the molds and refined the scan in CAD. The final grips are pocketed solid SLS parts to cut mass.",
  steps: [
    { kind: "image", src: `${MEDIA}/clay-grip.webp`, w: 1536, h: 1152, label: "01 · Clay", caption: "The driver's clay grip on the scanning fixture" },
    { kind: "video", src: `${MEDIA}/scan-rig`, label: "02 · Scan", caption: "Structured-light scan on a turntable" },
    { kind: "video", src: `${MEDIA}/scan-mesh`, label: "03 · Mesh", caption: "Aligning the scans into one mesh, before refining in CAD" },
    { kind: "image", src: `${MEDIA}/plate-grips.webp`, w: 2560, h: 1920, label: "04 · Print", caption: "FDM prototype grips on the waterjet-cut plate, printed in halves" },
  ] as const,
};

export const making = {
  lines: ["Making", "it."],
  cnc: {
    title: "CNC-milled standoffs",
    body: "I machined both 7075-T6 standoffs on the CNC mill from the machining drawings I released.",
    video: `${MEDIA}/cnc-standoff`,
    caption: "Milling the tri-standoff",
    photo: { src: `${MEDIA}/standoff-stack.webp`, w: 2560, h: 1920, caption: "Finished standoff stack with studs" },
  },
  waterjet: {
    title: "Waterjet-cut carbon",
    spec: "20-ply carbon fiber · pilot holes against delamination",
    body: "The baseplate was waterjet-cut from a 20-ply carbon-fiber sheet, with pilot holes so the jet doesn't delaminate the plies when it pierces.",
  },
};

export const landed = {
  lines: ["Where it", "landed."],
  onCar: { src: `${MEDIA}/on-car.webp`, w: 1920, h: 2560, caption: "A partial wheel on the car, mid-build. The final wheel didn't make it onto the car." },
  plate: { src: `${MEDIA}/plate-grips.webp`, w: 2560, h: 1920, caption: "Waterjet-cut plate with both prototype grips" },
  body: "I assembled the full prototype for driver evaluation.",
  lesson: {
    title: "What I'd change",
    body:
      "Don't sandwich the electronics between the standoffs. I chose a plastic enclosure to save weight, but putting the board in the load path made integrating the electronics far more complex than it needed to be. Next time I'd make the enclosure carbon, so the load goes straight through it, or aluminium.",
    photo: { src: `${MEDIA}/pcb-sandwich.webp`, w: 2560, h: 1920, caption: "The board, sandwiched on the aluminium standoff" },
  },
  next: "Since April 2026 I'm on the team's Dashboard & Telemetry, building the Pi/Qt driver display and CAN telemetry.",
};
