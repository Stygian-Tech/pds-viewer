import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.6,
  viewBox: "0 0 20 20",
};

export function FolderIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M2.75 5.75A1.75 1.75 0 0 1 4.5 4h3l1.6 1.75h6.4a1.75 1.75 0 0 1 1.75 1.75v7A1.75 1.75 0 0 1 15.5 16h-11a1.75 1.75 0 0 1-1.75-1.75Z" />
    </svg>
  );
}

export function RecordIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 2.75h6l4 4v10.5H5z" />
      <path d="M11 2.75v4h4M7.75 10h4.5M7.75 13h4.5" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M15.5 7A6 6 0 1 0 16 11" />
      <path d="M12.5 6.75H15.75V3.5" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4.5 6h11M8 3.5h4M6 6l.75 10.5h6.5L14 6M8.5 9v4.5M11.5 9v4.5" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 2.75 18 17H2zM10 7.25v4.5M10 14.5v.1" />
    </svg>
  );
}
