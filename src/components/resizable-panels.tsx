"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PANEL_LAYOUT_STORAGE_KEY,
  parseStoredPanelWidths,
  serializePanelWidths,
  type PanelWidths,
} from "@/lib/panel-layout";

interface BrowserColumnProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function BrowserColumn({
  title,
  subtitle,
  badge,
  headerActions,
  children,
}: BrowserColumnProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="shrink-0 border-b border-[#2b2b2b] bg-[#141414] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold text-zinc-300">{title}</h2>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            {badge !== undefined ? (
              <span className="text-xs text-zinc-500">{badge}</span>
            ) : null}
          </div>
        </div>
        {subtitle ? (
          <p className="mt-1 truncate font-mono text-xs text-zinc-500">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
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
      className="group relative z-10 w-px shrink-0 cursor-col-resize bg-[#2b2b2b] transition-colors hover:bg-emerald-500/50"
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
  defaultMiddleWidth = 520,
  minLeftWidth = 180,
  minMiddleWidth = 220,
  minRightWidth = 240,
}: ResizablePanelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<PanelWidths>(() => {
    const defaults = {
      leftWidth: defaultLeftWidth,
      middleWidth: defaultMiddleWidth,
    };
    if (typeof window === "undefined") {
      return defaults;
    }

    try {
      return (
        parseStoredPanelWidths(
          window.localStorage.getItem(PANEL_LAYOUT_STORAGE_KEY),
        ) ?? defaults
      );
    } catch {
      return defaults;
    }
  });
  const { leftWidth, middleWidth } = widths;
  const widthsRef = useRef(widths);
  const dragTarget = useRef<"left" | "middle" | null>(null);
  const dragStartX = useRef(0);
  const dragStartLeft = useRef(0);
  const dragStartMiddle = useRef(0);

  useEffect(() => {
    function fitWidthsToViewport() {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      if (containerWidth === 0) {
        return;
      }

      const availableWidth = containerWidth - 4;
      setWidths((current) => {
        const leftWidth = Math.min(
          Math.max(current.leftWidth, minLeftWidth),
          availableWidth - minMiddleWidth - minRightWidth,
        );
        const middleWidth = Math.min(
          Math.max(current.middleWidth, minMiddleWidth),
          availableWidth - leftWidth - minRightWidth,
        );
        if (
          leftWidth === current.leftWidth &&
          middleWidth === current.middleWidth
        ) {
          return current;
        }

        const next = { leftWidth, middleWidth };
        widthsRef.current = next;
        return next;
      });
    }

    fitWidthsToViewport();
    window.addEventListener("resize", fitWidthsToViewport);
    return () => window.removeEventListener("resize", fitWidthsToViewport);
  }, [minLeftWidth, minMiddleWidth, minRightWidth]);

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
        const leftWidth = clampLeftWidth(dragStartLeft.current + delta);
        setWidths((current) => {
          const next = { ...current, leftWidth };
          widthsRef.current = next;
          return next;
        });
        return;
      }

      const middleWidth = clampMiddleWidth(
        dragStartMiddle.current + delta,
        dragStartLeft.current,
      );
      setWidths((current) => {
        const next = { ...current, middleWidth };
        widthsRef.current = next;
        return next;
      });
    }

    function onMouseUp() {
      if (dragTarget.current) {
        try {
          window.localStorage.setItem(
            PANEL_LAYOUT_STORAGE_KEY,
            serializePanelWidths(widthsRef.current),
          );
        } catch {
          // The resized layout remains usable when browser storage is unavailable.
        }
      }
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
        className="flex min-h-0 shrink-0 flex-col bg-[#141414]"
      >
        {left}
      </div>

      <ResizeHandle onDragStart={(clientX) => startDrag("left", clientX)} />

      <div
        style={{ width: middleWidth }}
        className="flex min-h-0 shrink-0 flex-col bg-[#141414]"
      >
        {middle}
      </div>

      <ResizeHandle onDragStart={(clientX) => startDrag("middle", clientX)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#141414]">{right}</div>
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
