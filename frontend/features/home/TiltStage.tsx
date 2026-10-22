"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 3D stage for the hero illustration. The pointer's position over the hero
 * section is written to CSS variables (--tilt-x / --tilt-y in -1…1, --tilt-on
 * 0…1); globals.css turns them into a rotation of the scene, and layers marked
 * `.sf-depth` sit at their own depth (--z), which produces the parallax.
 *
 * Values are eased every frame (no CSS transition), so the motion stays smooth
 * and settles back to rest when the pointer leaves. Only for fine pointers with
 * hover and visitors who haven't asked for reduced motion; otherwise the scene
 * simply stays flat.
 */
export function TiltStage({ children, className }: { children: ReactNode; className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const area = scene.closest("section") ?? scene;
    const target = { x: 0, y: 0, on: 0 };
    const current = { x: 0, y: 0, on: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;
      current.on += (target.on - current.on) * 0.06;
      scene.style.setProperty("--tilt-x", current.x.toFixed(4));
      scene.style.setProperty("--tilt-y", current.y.toFixed(4));
      scene.style.setProperty("--tilt-on", current.on.toFixed(4));
      const settled =
        Math.abs(target.x - current.x) < 0.0005 && Math.abs(target.y - current.y) < 0.0005 && Math.abs(target.on - current.on) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      // Relative to the illustration's centre, so pointing at it feels direct.
      target.x = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.75));
      target.y = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.75));
      target.on = 1;
      start();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      target.on = 0;
      start();
    };

    area.addEventListener("pointermove", onMove as EventListener);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointermove", onMove as EventListener);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className={cn("[perspective:1400px]", className)}>
      <div ref={sceneRef} className="sf-tilt relative size-full">
        {children}
      </div>
    </div>
  );
}
