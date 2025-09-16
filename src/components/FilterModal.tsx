import { useEffect, useState } from "react";
import L from "leaflet";
import "../styles/filtermodal.css";

interface FilterModalProps {
  layerName: string | null;
  map: L.Map | null;
  onClose: () => void;
  onApplyFilter: (filteredLayer: {
    name: string;
    label: string;
    url: string;
    cql_filter: string;
  }) => void;
}

const FilterModal = ({ layerName, map, onClose, onApplyFilter }: FilterModalProps) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // 📌 Obtener columnas
  useEffect(() => {
    if (!layerName || !map) return;

    const fetchColumns = async () => {
      try {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        const url = `https://geoserver.soymetrix.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=${encodeURIComponent(
          layerName
        )}&outputFormat=application/json&bbox=${bbox},EPSG:4326&maxFeatures=1`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.features.length > 0) {
          setColumns(Object.keys(data.features[0].properties));
        }
      } catch (err) {
        console.error("Error obteniendo columnas:", err);
      }
    };

    fetchColumns();
  }, [layerName, map]);

  // 📌 Obtener valores únicos
  useEffect(() => {
    if (!layerName || !map || !selectedColumn) return;

    const fetchUniqueValues = async () => {
      try {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        const url = `https://geoserver.soymetrix.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=${encodeURIComponent(
          layerName
        )}&outputFormat=application/json&bbox=${bbox},EPSG:4326`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.features.length > 0) {
          const values = data.features.map((f: any) => f.properties[selectedColumn]);
          const unique = Array.from(
            new Set<string>(values.filter((v: any) => v !== null && v !== ""))
          );
          setUniqueValues(unique);
        }
      } catch (err) {
        console.error("Error obteniendo valores únicos:", err);
      }
    };

    fetchUniqueValues();
  }, [selectedColumn, layerName, map]);

  // 📌 Aplicar filtro
  const applyFilter = () => {
    if (!map || !layerName || !selectedColumn || selectedValues.length === 0) return;

    const cql = `${selectedColumn} IN (${selectedValues.map((v) => `'${v}'`).join(",")})`;

    onApplyFilter({
      name: layerName,
      label: `${layerName} (filtro)`,
      url: "https://geoserver.soymetrix.com/geoserver/wms",
      cql_filter: cql,
    });

    onClose();
  };

  if (!layerName) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>
          Separe las entidades de la capa según los valores de sus columnas. Indique la columna que
          desea visualizar y seleccione las entidades que quiere separar.
        </div>

        {/* Columna */}
        <div style={{ marginBottom: "10px" }}>
          <label>Columna:</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            <option value="">Seleccione columna</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Valores */}
        {selectedColumn && (
          <div style={{ marginBottom: "10px" }}>
            <label>Entidades:</label>
            <select
              multiple
              value={selectedValues}
              onChange={(e) =>
                setSelectedValues(Array.from(e.target.selectedOptions, (opt) => opt.value))
              }
              style={{ width: "100%", height: "120px" }}
            >
              {uniqueValues.map((val, i) => (
                <option key={i} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
          <button
            onClick={applyFilter}
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
    </div>
  );
};

export default FilterModal;

