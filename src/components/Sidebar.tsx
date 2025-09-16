import { Rnd } from "react-rnd";
import { ChromePicker, ColorResult } from "react-color";

interface SidebarProps {
  fillColor: string;
  setFillColor: (color: string) => void;
  fillOpacity: number;
  setFillOpacity: (opacity: number) => void;
}

const Sidebar = ({ fillColor, setFillColor, fillOpacity, setFillOpacity }: SidebarProps) => {
  return (
    <Rnd
      default={{
        x: 50,
        y: 80,
        width: 280,
        height: "auto",
      }}
      bounds="window"
      enableResizing={false}
      style={{
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      <h3>🎨 Simbología</h3>

      <ChromePicker
        color={fillColor}
        onChange={(c: ColorResult) => setFillColor(c.hex)}
        disableAlpha
      />

      <div style={{ marginTop: "15px" }}>
        <label>Opacidad del relleno: {fillOpacity}</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={fillOpacity}
          onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </Rnd>
  );
};
export default Sidebar;