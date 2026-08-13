export const PANEL_LAYOUT_STORAGE_KEY = "pds-viewer:panel-layout:v1";

export interface PanelWidths {
  leftWidth: number;
  middleWidth: number;
}

interface StoredPanelLayout extends PanelWidths {
  version: 1;
}

export function parseStoredPanelWidths(value: string | null): PanelWidths | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredPanelLayout>;
    if (
      parsed.version !== 1 ||
      !Number.isFinite(parsed.leftWidth) ||
      !Number.isFinite(parsed.middleWidth) ||
      (parsed.leftWidth ?? 0) <= 0 ||
      (parsed.middleWidth ?? 0) <= 0
    ) {
      return null;
    }

    return {
      leftWidth: parsed.leftWidth as number,
      middleWidth: parsed.middleWidth as number,
    };
  } catch {
    return null;
  }
}

export function serializePanelWidths(widths: PanelWidths): string {
  return JSON.stringify({ version: 1, ...widths } satisfies StoredPanelLayout);
}
