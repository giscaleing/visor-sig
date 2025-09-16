import { useState } from "react";
import { Rnd } from "react-rnd";
import "../components/layersidebar.css";
import L from "leaflet";
import { useCounts } from "./hooks/useCounts";
import AttributeTableModal from "./AttributeTableModal";
import FilterModal from "./FilterModal";

interface LayerConfig {
  id: string;
  name: string;
  label: string;
  active: boolean;
  setter: (value: boolean) => void;
  cql_filter?: string;
}

interface LayerSidebarProps {
  layers: LayerConfig[];
  map: L.Map | null;
  onApplyFilter: (filteredLayer: {
    name: string;
    label: string;
    url: string;
    cql_filter: string;
  }) => void;
  onOpenSymbology: (layerId: string) => void; // 👈 agregado
}

const LayerSidebar = ({ layers, map, onApplyFilter, onOpenSymbology }: LayerSidebarProps) => {
  const counts = useCounts(
    map,
    layers.map((l) => ({
      id: l.id,
      name: l.name,
      active: l.active,
      cql_filter: l.cql_filter,
    }))
  );

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [filterLayer, setFilterLayer] = useState<string | null>(null);

  return (
    <>
      <Rnd
        default={{
          x: 350,
          y: 20,
          width: 260,
          height: "auto",
        }}
        bounds="window"
        enableResizing={false}
        style={{ zIndex: 4000 }}
      >
        <div className="layer-sidebar-container">
          <h4>📂 Capas</h4>
          {layers.map((layer) => (
            <div
              key={layer.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
                position: "relative",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={layer.active}
                  onChange={(e) => layer.setter(e.target.checked)}
                />
                {layer.label}{" "}
                <span>
                  ({counts[layer.id]?.visible ?? 0} /{" "}
                  {counts[layer.id]?.total ?? 0})
                </span>
              </label>

              {/* Botón menú tres puntos */}
              <button
                onClick={() =>
                  setOpenMenu(openMenu === layer.id ? null : layer.id)
                }
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "4px",
                }}
              >
                ⋮
              </button>

              {/* Menú contextual */}
              {openMenu === layer.id && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "24px",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                    zIndex: 5000,
                    padding: "6px 10px",
                    minWidth: "160px",
                  }}
                >
                  {/* Tabla de atributos */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      padding: "6px 0",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      setSelectedLayer(layer.name);
                      setOpenMenu(null);
                    }}
                  >
                    📊 Tabla de atributos
                  </div>

                  {/* Filtro por atributo */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      padding: "6px 0",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      setFilterLayer(layer.name);
                      setOpenMenu(null);
                    }}
                  >
                    🔍 Atributo
                  </div>

                  {/* Nueva opción: Simbología */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      padding: "6px 0",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      onOpenSymbology(layer.id);
                      setOpenMenu(null);
                    }}
                  >
                    🎨 Simbología
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Rnd>

      {/* Modal de atributos */}
      <AttributeTableModal
        layerName={selectedLayer}
        onClose={() => setSelectedLayer(null)}
        map={map}
      />

      {/* Modal de filtros */}
      <FilterModal
        layerName={filterLayer}
        onClose={() => setFilterLayer(null)}
        map={map}
        onApplyFilter={onApplyFilter}
      />
    </>
  );
};

export default LayerSidebar;


