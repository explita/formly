import React, { useState, useRef, useCallback, useEffect } from "react";
import { renderStyles } from "./lib/utils.js";
import type { DevToolsFABProps } from "./types/index.js";

export function DevToolsFAB({
  placement,
  onPlacementChange,
  onOpen,
  boundary,
}: DevToolsFABProps) {
  const [fabDragOffset, setFabDragOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const fabDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Ref to hold the current dragging offset to prevent React stale closure bugs
  const fabDragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const fabDragMetrics = useRef({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    width: 0,
    height: 0,
    minLeft: 0,
    maxLeft: 0,
    minTop: 0,
    maxTop: 0,
    parentLeft: 0,
    parentTop: 0,
    boundaryWidth: 0,
    boundaryHeight: 0,
  });

  const handleFabMouseMove = useCallback((e: MouseEvent) => {
    if (!fabDraggingRef.current) return;
    const metrics = fabDragMetrics.current;
    const deltaX = e.clientX - metrics.startX;
    const deltaY = e.clientY - metrics.startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      wasDraggedRef.current = true;
    }

    const newX = metrics.startPosX + deltaX;
    const newY = metrics.startPosY + deltaY;

    const clampedLeft = Math.max(
      metrics.minLeft,
      Math.min(metrics.maxLeft, newX),
    );
    const clampedTop = Math.max(
      metrics.minTop,
      Math.min(metrics.maxTop, newY),
    );

    const relativeX = clampedLeft - metrics.parentLeft;
    const relativeY = clampedTop - metrics.parentTop;

    const nextPos = { x: relativeX, y: relativeY };
    fabDragOffsetRef.current = nextPos;
    setFabDragOffset(nextPos);
  }, []);

  const handleFabTouchMove = useCallback((e: TouchEvent) => {
    if (!fabDraggingRef.current) return;
    const touch = e.touches[0];
    const metrics = fabDragMetrics.current;
    const deltaX = touch.clientX - metrics.startX;
    const deltaY = touch.clientY - metrics.startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      wasDraggedRef.current = true;
    }

    const newX = metrics.startPosX + deltaX;
    const newY = metrics.startPosY + deltaY;

    const clampedLeft = Math.max(
      metrics.minLeft,
      Math.min(metrics.maxLeft, newX),
    );
    const clampedTop = Math.max(
      metrics.minTop,
      Math.min(metrics.maxTop, newY),
    );

    const relativeX = clampedLeft - metrics.parentLeft;
    const relativeY = clampedTop - metrics.parentTop;

    const nextPos = { x: relativeX, y: relativeY };
    fabDragOffsetRef.current = nextPos;
    setFabDragOffset(nextPos);
    e.preventDefault();
  }, []);

  const [isSnapping, setIsSnapping] = useState(false);

  const handleFabRelease = useCallback(() => {
    if (!fabDraggingRef.current) return;
    fabDraggingRef.current = false;

    document.removeEventListener("mousemove", handleFabMouseMove);
    document.removeEventListener("mouseup", handleFabRelease);
    document.removeEventListener("touchmove", handleFabTouchMove);
    document.removeEventListener("touchend", handleFabRelease);

    const metrics = fabDragMetrics.current;
    const boundaryWidth = metrics.boundaryWidth || window.innerWidth;
    const boundaryHeight = metrics.boundaryHeight || window.innerHeight;

    const currentX = fabDragOffsetRef.current?.x
      ? fabDragOffsetRef.current.x + metrics.parentLeft
      : metrics.startPosX;
    const currentY = fabDragOffsetRef.current?.y
      ? fabDragOffsetRef.current.y + metrics.parentTop
      : metrics.startPosY;

    const midX = metrics.parentLeft + boundaryWidth / 2;
    const midY = metrics.parentTop + boundaryHeight / 2;

    const isLeft = currentX + metrics.width / 2 < midX;
    const isTop = currentY + metrics.height / 2 < midY;

    let newPlacement: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    if (isLeft && isTop) {
      newPlacement = "top-left";
    } else if (!isLeft && isTop) {
      newPlacement = "top-right";
    } else if (isLeft && !isTop) {
      newPlacement = "bottom-left";
    } else {
      newPlacement = "bottom-right";
    }

    // Determine corner snap coordinates to glide smoothly
    let targetX = 20;
    let targetY = 20;

    if (newPlacement === "top-left") {
      targetX = 20;
      targetY = 20;
    } else if (newPlacement === "top-right") {
      targetX = boundaryWidth - metrics.width - 20;
      targetY = 20;
    } else if (newPlacement === "bottom-left") {
      targetX = 20;
      targetY = boundaryHeight - metrics.height - 20;
    } else {
      targetX = boundaryWidth - metrics.width - 20;
      targetY = boundaryHeight - metrics.height - 20;
    }

    setIsSnapping(true);
    const snapPos = { x: targetX, y: targetY };
    fabDragOffsetRef.current = snapPos;
    setFabDragOffset(snapPos);

    onPlacementChange(newPlacement);

    // Let the smooth transition finish (300ms) before clearing the fixed coordinate style fallback
    setTimeout(() => {
      fabDragOffsetRef.current = null;
      setFabDragOffset(null);
      setIsSnapping(false);
    }, 300);
  }, [onPlacementChange, handleFabMouseMove, handleFabTouchMove]);

  const handleFabMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (!fabRef.current) return;

    fabDraggingRef.current = true;
    wasDraggedRef.current = false;
    const rect = fabRef.current.getBoundingClientRect();
    const parent = fabRef.current.parentElement;
    const useParent = boundary === "parent" && parent;
    const parentRect = useParent ? parent.getBoundingClientRect() : null;

    fabDragMetrics.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: rect.left,
      startPosY: rect.top,
      width: rect.width,
      height: rect.height,
      minLeft: parentRect ? parentRect.left : 0,
      maxLeft: parentRect ? parentRect.right - rect.width : window.innerWidth - rect.width,
      minTop: parentRect ? parentRect.top : 0,
      maxTop: parentRect ? parentRect.bottom - rect.height : window.innerHeight - rect.height,
      parentLeft: parentRect ? parentRect.left : 0,
      parentTop: parentRect ? parentRect.top : 0,
      boundaryWidth: parentRect ? parentRect.width : window.innerWidth,
      boundaryHeight: parentRect ? parentRect.height : window.innerHeight,
    };

    // Calculate relative starting coordinates to prevent coordinate jump
    const startPosX = rect.left - (parentRect ? parentRect.left : 0);
    const startPosY = rect.top - (parentRect ? parentRect.top : 0);

    const initialPos = { x: startPosX, y: startPosY };
    fabDragOffsetRef.current = initialPos;
    setFabDragOffset(initialPos);

    document.addEventListener("mousemove", handleFabMouseMove);
    document.addEventListener("mouseup", handleFabRelease);
    e.preventDefault();
  };

  const handleFabTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!fabRef.current) return;
    const touch = e.touches[0];

    fabDraggingRef.current = true;
    wasDraggedRef.current = false;
    const rect = fabRef.current.getBoundingClientRect();
    const parent = fabRef.current.parentElement;
    const useParent = boundary === "parent" && parent;
    const parentRect = useParent ? parent.getBoundingClientRect() : null;

    fabDragMetrics.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: rect.left,
      startPosY: rect.top,
      width: rect.width,
      height: rect.height,
      minLeft: parentRect ? parentRect.left : 0,
      maxLeft: parentRect ? parentRect.right - rect.width : window.innerWidth - rect.width,
      minTop: parentRect ? parentRect.top : 0,
      maxTop: parentRect ? parentRect.bottom - rect.height : window.innerHeight - rect.height,
      parentLeft: parentRect ? parentRect.left : 0,
      parentTop: parentRect ? parentRect.top : 0,
      boundaryWidth: parentRect ? parentRect.width : window.innerWidth,
      boundaryHeight: parentRect ? parentRect.height : window.innerHeight,
    };

    const startPosX = rect.left - (parentRect ? parentRect.left : 0);
    const startPosY = rect.top - (parentRect ? parentRect.top : 0);

    const initialPos = { x: startPosX, y: startPosY };
    fabDragOffsetRef.current = initialPos;
    setFabDragOffset(initialPos);

    document.addEventListener("touchmove", handleFabTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleFabRelease);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleFabMouseMove);
      document.removeEventListener("mouseup", handleFabRelease);
      document.removeEventListener("touchmove", handleFabTouchMove);
      document.removeEventListener("touchend", handleFabRelease);
    };
  }, [handleFabMouseMove, handleFabTouchMove, handleFabRelease]);

  return (
    <>
      {renderStyles()}
      <button
        ref={fabRef}
        className={`formly-devtools-fab ${placement} ${boundary === "parent" ? "boundary-parent" : ""}`}
        onMouseDown={handleFabMouseDown}
        onTouchStart={handleFabTouchStart}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (!wasDraggedRef.current) {
            onOpen();
          }
        }}
        style={
          fabDragOffset
            ? {
                position: "fixed" as const,
                left: `${fabDragOffset.x}px`,
                top: `${fabDragOffset.y}px`,
                bottom: "auto",
                right: "auto",
                transform: "none",
                transition: isSnapping
                  ? "left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              }
            : undefined
        }
        title="Open Formly DevTools"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="formly-devtools-badge">DevTools</span>
      </button>
    </>
  );
}
