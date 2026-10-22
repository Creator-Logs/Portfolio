"use client";

import { useMediaQuery } from "./useMediaQuery";

// Matches DESIGN.md `md` breakpoint (768px).
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
