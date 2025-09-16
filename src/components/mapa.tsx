import { MapContainer, TileLayer, WMSTileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

import LayerSidebar from "./LayerSidebar";
import FeatureInfo from "./FeatureInfo";
import SymbologyModal, { LayerStyle, GeometryType } from "./SymbologyModal";
import buildSldStyle from "../utils/buildSldStyle";

const MapRefSetter = ({ onReady }: { onReady: (map: L.Map) => void }) => {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
};

// Estilo base para puntos por defecto (círculos)
const DEFAULT_POINT_STYLE: LayerStyle = {
  fillColor: "#2ECC71",
  fillOpacity: 0.7,
  strokeColor: "#000000",
  strokeOpacity: 1,
  strokeWidth: 1,
  radius: 14,
};

// Utilidad para mapear GeoJSON geometry a nuestro enum
function normalizeGeom(gjsonType: string): GeometryType {
  const t = (gjsonType || "").toLowerCase();
  if (t.includes("point")) return "point";
  if (t.includes("line")) return "line";
  return "polygon";
}

const Mapa = () => {
  const [map, setMap] = useState<L.Map | null>(null);

  const [showColonias, setShowColonias] = useState(false);
  const [showIdentificate, setShowIdentificate] = useState(false);

  // SLD aplicado por capa (clave: typename)
  const [sldBodies, setSldBodies] = useState<Record<string, string>>({});

  // Cache del tipo de geometría por capa
  const [geomTypes, setGeomTypes] = useState<Record<string, GeometryType>>({});

  // Control del modal de simbología
  const [symbologyLayer, setSymbologyLayer] = useState<string | null>(null);
  const [symbologyGeomType, setSymbologyGeomType] =
    useState<GeometryType>("polygon");

  // 👇 estado para capas filtradas
  const [filteredLayers, setFilteredLayers] = useState<
    { id: string; name: string; label: string; url: string; cql_filter: string; active: boolean }[]
  >([]);

  const handleApplyFilter = (filteredLayer: {
    name: string;
    label: string;
    url: string;
    cql_filter: string;
  }) => {
    const id = `${filteredLayer.name}_filtro_${Date.now()}`;
    setFilteredLayers((prev) => [
      ...prev,
      {
        id,
        name: filteredLayer.name,
        label: `${filteredLayer.label} (filtro)`,
        url: filteredLayer.url,
        cql_filter: filteredLayer.cql_filter,
        active: true,
      },
    ]);
  };

  // --- Detección de tipo de geometría via WFS (cacheado) ---
  const detectGeometryType = async (typeName: string): Promise<GeometryType> => {
    if (geomTypes[typeName]) return geomTypes[typeName];

    try {
      const url =
        `https://geoserver.soymetrix.com/geoserver/wfs` +
        `?service=WFS&version=1.1.0&request=GetFeature` +
        `&typeName=${encodeURIComponent(typeName)}` +
        `&outputFormat=application/json&maxFeatures=1&srsName=EPSG:4326`;
      const res = await fetch(url);
      const data = await res.json();

      const gjsonType: string =
        data?.features?.[0]?.geometry?.type || "Polygon";
      const gt = normalizeGeom(gjsonType);

      setGeomTypes((prev) => ({ ...prev, [typeName]: gt }));
      return gt;
    } catch (e) {
      console.warn("No se pudo detectar tipo de geometría para", typeName, e);
      return "polygon";
    }
  };

  // --- Abrir modal de simbología con tipo correcto ---
  const handleOpenSymbology = async (layerId: string) => {
    const gt = await detectGeometryType(layerId);
    setSymbologyGeomType(gt);
    setSymbologyLayer(layerId);
  };

  // --- Aplicar simbología (genera SLD con <Name>) ---
  const handleApplySymbology = (layer: string, _sld: string, style: LayerStyle) => {
    const gt = geomTypes[layer] || "polygon";
    const sldWithLayer = buildSldStyle(style, gt, layer);

    console.log("=== APLICANDO SIMBOLOGÍA ===");
    console.log("🗂️ Capa:", layer);
    console.log("🔷 Tipo:", gt);
    console.log("🎨 Estilo:", style);
    console.log("📄 XML SLD generado:\n", sldWithLayer);

    setSldBodies((prev) => ({
      ...prev,
      [layer]: sldWithLayer,
    }));
  };

  // 👉 Al activar Identificate, si es de puntos y no hay SLD, aplicamos círculo por defecto
  useEffect(() => {
    (async () => {
      if (!showIdentificate) return;
      const layerName = "metrix:identificate";
      const gt = await detectGeometryType(layerName);
      if (gt === "point" && !sldBodies[layerName]) {
        const sld = buildSldStyle(DEFAULT_POINT_STYLE, "point", layerName);
        setSldBodies((prev) => ({ ...prev, [layerName]: sld }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIdentificate]);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MapContainer
        center={[5.60971, -76.08175]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <MapRefSetter onReady={(m) => setMap(m)} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />

        {/* Colonias (polígono) */}
        {showColonias && (
          <WMSTileLayer
            key={`colonias-${sldBodies["metrix:colonias"] || "default"}-${Date.now()}`}
            url="https://geoserver.soymetrix.com/geoserver/wms"
            layers="metrix:colonias"
            format="image/png"
            transparent={true}
            version="1.1.1"
            params={
              {
                ...(sldBodies["metrix:colonias"]
                  ? { SLD_BODY: sldBodies["metrix:colonias"] }
                  : {}),
              } as any
            }
          />
        )}

        {/* Identificate (punto) */}
        {showIdentificate && (
          <WMSTileLayer
            key={`identificate-${sldBodies["metrix:identificate"] || "default"}-${Date.now()}`}
            url="https://geoserver.soymetrix.com/geoserver/wms"
            layers="metrix:identificate"
            format="image/png"
            transparent={true}
            version="1.1.1"
            params={
              {
                ...(sldBodies["metrix:identificate"]
                  ? { SLD_BODY: sldBodies["metrix:identificate"] }
                  : {}),
              } as any
            }
          />
        )}

        {/* Capas filtradas dinámicamente */}
        {filteredLayers.map((fl) =>
          fl.active ? (
            <WMSTileLayer
              key={`${fl.id}-${sldBodies[fl.name] || "default"}-${Date.now()}`}
              url={fl.url}
              layers={fl.name}
              format="image/png"
              transparent={true}
              version="1.1.1"
              params={
                {
                  ...(sldBodies[fl.name] ? { SLD_BODY: sldBodies[fl.name] } : {}),
                  ...(fl.cql_filter ? { CQL_FILTER: fl.cql_filter } : {}),
                } as any
              }
            />
          ) : null
        )}

        <FeatureInfo showColonias={showColonias} showIdentificate={showIdentificate} />
      </MapContainer>

      <LayerSidebar
        map={map}
        layers={[
          {
            id: "metrix:colonias",
            name: "metrix:colonias",
            label: "Colonias",
            active: showColonias,
            setter: setShowColonias,
          },
          {
            id: "metrix:identificate",
            name: "metrix:identificate",
            label: "Identificate",
            active: showIdentificate,
            setter: setShowIdentificate,
          },
          ...filteredLayers.map((fl) => ({
            id: fl.id,
            name: fl.name,
            label: fl.label,
            active: fl.active,
            cql_filter: fl.cql_filter,
            setter: (value: boolean) => {
              setFilteredLayers((prev) =>
                prev.map((l) => (l.id === fl.id ? { ...l, active: value } : l))
              );
            },
          })),
        ]}
        onApplyFilter={handleApplyFilter}
        onOpenSymbology={(layerId: string) => {
          // abrimos modal con tipo correcto (detectado vía WFS)
          handleOpenSymbology(layerId);
        }}
      />

      {symbologyLayer && (
        <SymbologyModal
          layerName={symbologyLayer}
          geometryType={symbologyGeomType} // 👈 pasa point/line/polygon al modal
          onApply={handleApplySymbology}
          onClose={() => setSymbologyLayer(null)}
        />
      )}
    </div>
  );
};

export default Mapa;






