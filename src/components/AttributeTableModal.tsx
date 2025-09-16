import { useEffect, useState } from "react";
import L from "leaflet";
import "../styles/tablemodal.css";

interface AttributeTableModalProps {
  layerName: string | null;
  onClose: () => void;
  map: L.Map | null;
}

const AttributeTableModal = ({ layerName, onClose, map }: AttributeTableModalProps) => {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [total, setTotal] = useState(0);

  // 🔹 columnas visibles
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!layerName || !map) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        const startIndex = (page - 1) * pageSize;

        const url = `https://geoserver.soymetrix.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json&bbox=${bbox},EPSG:4326&maxFeatures=${pageSize}&startIndex=${startIndex}`;
        const res = await fetch(url);
        const data = await res.json();
        setFeatures(data.features || []);

        const hitsUrl = `https://geoserver.soymetrix.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=${layerName}&srsName=EPSG:4326&resultType=hits&bbox=${bbox},EPSG:4326`;
        const hitsRes = await fetch(hitsUrl);
        const hitsText = await hitsRes.text();
        const match = hitsText.match(/numberOfFeatures="(\d+)"/);
        setTotal(match ? parseInt(match[1], 10) : 0);

        // Inicializar columnas visibles solo una vez
        if (data.features?.length > 0 && Object.keys(visibleColumns).length === 0) {
          const init: Record<string, boolean> = {};
          Object.keys(data.features[0].properties).forEach((k) => (init[k] = true));
          setVisibleColumns(init);
        }
      } catch (err) {
        console.error("Error cargando atributos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [layerName, map, page]);

  if (!layerName) return null;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>📊 Tabla de atributos - {layerName}</h3>
          <div>
            {/* Botón para abrir menú de columnas */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                marginRight: "10px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              ⚙️ Columnas
            </button>

            <button
              onClick={onClose}
              style={{
                background: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
        </div>

        {/* Menú flotante de selección */}
        {menuOpen && features.length > 0 && (
          <div
            style={{
              position: "absolute",
              right: "40px",
              top: "60px",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "10px",
              maxHeight: "300px",
              overflowY: "auto",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
              zIndex: 7000,
            }}
          >
            {Object.keys(features[0].properties).map((col) => (
              <div key={col}>
                <label>
                  <input
                    type="checkbox"
                    checked={visibleColumns[col]}
                    onChange={() =>
                      setVisibleColumns({ ...visibleColumns, [col]: !visibleColumns[col] })
                    }
                  />
                  {" "}{col}
                </label>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p>Cargando datos...</p>
        ) : features.length > 0 ? (
          <>
            {/* Tabla */}
            <div className="table-container">
              <table className="table-attributes">
                <thead>
                  <tr>
                    {Object.keys(features[0].properties)
                      .filter((k) => visibleColumns[k])
                      .map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr key={i}>
                      {Object.entries(f.properties)
                        .filter(([k]) => visibleColumns[k])
                        .map(([_, val], j) => (
                          <td key={j}>{String(val ?? "")}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📌 Paginador */}
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: "6px 12px",
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                ⬅ Anterior
              </button>
              <span>
                Página {page} de {totalPages} ({total} elementos)
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "6px 12px",
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                Siguiente ➡
              </button>
            </div>
          </>
        ) : (
          <p>No hay datos visibles en el área actual.</p>
        )}
      </div>
    </div>
  );
};

export default AttributeTableModal;

