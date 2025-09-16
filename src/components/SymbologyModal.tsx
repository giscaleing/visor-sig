import { useState } from "react";
import { Rnd } from "react-rnd";
import { ChromePicker } from "react-color";
import buildSldStyle from "../utils/buildSldStyle";

export type GeometryType = "polygon" | "line" | "point";

export interface LayerStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  radius?: number;
}

interface SymbologyModalProps {
  layerName: string;
  initialStyle?: LayerStyle;
  geometryType?: GeometryType;
  onApply: (layer: string, sld: string, style: LayerStyle) => void;
  onClose: () => void;
}

const defaultStyle: LayerStyle = {
  fillColor: "#008000",
  fillOpacity: 0.6,
  strokeColor: "#000000",
  strokeOpacity: 1,
  strokeWidth: 1,
  radius: 14,
};

const SymbologyModal = ({
  layerName,
  initialStyle = defaultStyle,
  geometryType = "polygon",
  onApply,
  onClose,
}: SymbologyModalProps) => {
  const [style, setStyle] = useState<LayerStyle>(initialStyle);

  const handleApply = () => {
    const sld = buildSldStyle(style, geometryType);

    // 🟢 LOG DEBUG → revisa consola
    console.log("=== APLICANDO SIMBOLOGÍA ===");
    console.log("📌 Capa:", layerName);
    console.log("🎨 Estilo:", style);
    console.log("📄 XML SLD generado:\n", sld);

    onApply(layerName, sld, style);
    onClose();
  };

  return (
    <Rnd
      default={{ x: 100, y: 100, width: 320, height: "auto" }}
      enableResizing={false}
      bounds="window"
      style={{ zIndex: 5000 }}
    >
      <div
        style={{
          background: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          zIndex: 5001,
          position: "relative",
        }}
      >
        <h4>🎨 Simbología - {layerName}</h4>

        {(geometryType === "polygon" || geometryType === "point") && (
          <>
            <label>Color de relleno</label>
            <ChromePicker
              color={style.fillColor}
              onChange={(c) => setStyle({ ...style, fillColor: c.hex })}
            />

            <label>Opacidad relleno: {style.fillOpacity}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={style.fillOpacity}
              onChange={(e) =>
                setStyle({ ...style, fillOpacity: parseFloat(e.target.value) })
              }
            />
          </>
        )}

        <label>{geometryType === "line" ? "Color de línea" : "Color de borde"}</label>
        <ChromePicker
          color={style.strokeColor}
          onChange={(c) => setStyle({ ...style, strokeColor: c.hex })}
        />

        <label>
          Opacidad {geometryType === "line" ? "línea" : "borde"}:{" "}
          {style.strokeOpacity}
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={style.strokeOpacity}
          onChange={(e) =>
            setStyle({ ...style, strokeOpacity: parseFloat(e.target.value) })
          }
        />

        <label>
          Grosor {geometryType === "line" ? "línea" : "borde"}: {style.strokeWidth}
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={style.strokeWidth}
          onChange={(e) =>
            setStyle({ ...style, strokeWidth: parseInt(e.target.value) })
          }
        />

        {geometryType === "point" && (
          <>
            <label>Radio: {style.radius}</label>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={style.radius}
              onChange={(e) =>
                setStyle({ ...style, radius: parseInt(e.target.value) })
              }
            />
          </>
        )}

        <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
          <button
            onClick={handleApply}
            style={{
              background: "#3498db",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Aplicar
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#e74c3c",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Rnd>
  );
};

export default SymbologyModal;

