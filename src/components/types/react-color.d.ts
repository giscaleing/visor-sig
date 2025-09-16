declare module "react-color" {
  import * as React from "react";

  export interface RGBColor { r: number; g: number; b: number; a?: number }
  export interface HSLColor { h: number; s: number; l: number; a?: number }
  export interface ColorResult {
    hex: string;
    rgb: RGBColor;
    hsl: HSLColor;
  }

  export interface ChromePickerProps {
    color: string | RGBColor | HSLColor;
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
    disableAlpha?: boolean;
  }

  export const ChromePicker: React.ComponentType<ChromePickerProps>;
}
