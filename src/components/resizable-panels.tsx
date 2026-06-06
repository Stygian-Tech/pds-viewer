"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface BrowserColumnProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  children: ReactNode;
}

export function BrowserColumn({
  title,
  subtitle,
  badge,
  children,
}: BrowserColumnProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="shrink-0 border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-300">{title}</h2>
          {badge !== undefined ? (
            <span className="text-xs text-zinc-500">{badge}</span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1 truncate font-mono text-xs text-zinc-500">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
        {children}
      </div>
    </div>
  );
}

function ResizeHandle({
  onDragStart,
}: {
  onDragStart: (clientX: number) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
      onMouseDown={(event) => {
        event.preventDefault();
        onDragStart(event.clientX);
      }}
      className="group relative z-10 w-1 shrink-0 cursor-col-resize bg-zinc-800/40 transition-colors hover:bg-emerald-500/40"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}

interface ResizablePanelsProps {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
  defaultLeftWidth?: number;
  defaultMiddleWidth?: number;
  minLeftWidth?: number;
  minMiddleWidth?: number;
  minRightWidth?: number;
}

export function ResizablePanels({
  left,
  middle,
  right,
  defaultLeftWidth = 280,
  defaultMiddleWidth = 360,
  minLeftWidth = 180,
  minMiddleWidth = 220,
  minRightWidth = 240,
}: ResizablePanelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [middleWidth, setMiddleWidth] = useState(defaultMiddleWidth);
  const dragTarget = useRef<"left" | "middle" | null>(null);
  const dragStartX = useRef(0);
  const dragStartLeft = useRef(0);
  const dragStartMiddle = useRef(0);

  const clampMiddleWidth = useCallback(
    (nextMiddle: number, nextLeft = leftWidth) => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const handleWidth = 2;
      const maxMiddle =
        containerWidth - nextLeft - minRightWidth - handleWidth * 2;
      return Math.min(Math.max(nextMiddle, minMiddleWidth), maxMiddle);
    },
    [leftWidth, minMiddleWidth, minRightWidth],
  );

  const clampLeftWidth = useCallback(
    (nextLeft: number) => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const handleWidth = 2;
      const maxLeft =
        containerWidth - middleWidth - minRightWidth - handleWidth * 2;
      return Math.min(Math.max(nextLeft, minLeftWidth), maxLeft);
    },
    [middleWidth, minLeftWidth, minRightWidth],
  );

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (!dragTarget.current) {
        return;
      }

      const delta = event.clientX - dragStartX.current;

      if (dragTarget.current === "left") {
        setLeftWidth(clampLeftWidth(dragStartLeft.current + delta));
        return;
      }

      setMiddleWidth(
        clampMiddleWidth(
          dragStartMiddle.current + delta,
          dragStartLeft.current,
        ),
      );
    }

    function onMouseUp() {
      dragTarget.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [clampLeftWidth, clampMiddleWidth, leftWidth]);

  function startDrag(target: "left" | "middle", clientX: number) {
    dragTarget.current = target;
    dragStartX.current = clientX;
    dragStartLeft.current = leftWidth;
    dragStartMiddle.current = middleWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div ref={containerRef} className="hidden min-h-0 flex-1 lg:flex">
      <div
        style={{ width: leftWidth }}
        className="flex min-h-0 shrink-0 flex-col border-r border-zinc-800"
      >
        {left}
      </div>

      <ResizeHandle onDragStart={(clientX) => startDrag("left", clientX)} />

      <div
        style={{ width: middleWidth }}
        className="flex min-h-0 shrink-0 flex-col border-r border-zinc-800"
      >
        {middle}
      </div>

      <ResizeHandle onDragStart={(clientX) => startDrag("middle", clientX)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{right}</div>
    </div>
  );
}

export function StackedPanels({
  left,
  middle,
  right,
}: {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
      <div className="flex max-h-[38vh] min-h-0 shrink-0 flex-col border-b border-zinc-800">
        {left}
      </div>
      <div className="flex max-h-[38vh] min-h-0 shrink-0 flex-col border-b border-zinc-800">
        {middle}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{right}</div>
    </div>
  );
}
