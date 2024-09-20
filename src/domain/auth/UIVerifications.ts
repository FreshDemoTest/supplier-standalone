export interface UIVerifiedMenuItemChildren {
  title: string;
  path: string;
  display: boolean;
}

export interface UIVerifiedMenuItem {
  title: string;
  path: string;
  icon: JSX.Element;
  lgIcon: JSX.Element;
  display: boolean;
  children?: Array<UIVerifiedMenuItemChildren>;
  available?: boolean;
}

export interface UIVerifiedMenuOption {
  subheader: string;
  items: Array<UIVerifiedMenuItem>;
}

export interface UIVerifiedMenuOptions {
  default: Array<UIVerifiedMenuOption>;
}
