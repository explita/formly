import { FormInstance } from "../../../types/utils.js";

export interface DevToolsState {
  position?: { x: number; y: number };
  isOpen?: boolean;
  selectedFormId?: string;
  fabPlacement?: Placement;
  activeTab?: string;
}

export type FormDevToolsProps = {
  use: FormInstance<any, any, any>;
  initialOpen?: boolean;
  position?: Placement;
  forceShow?: boolean;
  boundary?: DevtoolBoundary;
};

export type DevToolsFABProps = {
  placement: Placement;
  onPlacementChange: (placement: Placement) => void;
  onOpen: () => void;
  boundary?: DevtoolBoundary;
};

export type Placement =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export type DevtoolBoundary = "viewport" | "parent";
