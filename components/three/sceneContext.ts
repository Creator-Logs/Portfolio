"use client";

import { createContext, useContext } from "react";

// Provided *inside* the View (drei tunnels View children into the canvas tree, so a DOM-side
// provider wouldn't reach them). `active`: block on screen and motion allowed — gate per-frame work on it.
export const SceneContext = createContext({ active: false });
export const useSceneBlock = () => useContext(SceneContext);
