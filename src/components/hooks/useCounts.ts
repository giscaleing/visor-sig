import { useEffect, useState, useMemo } from "react";
import L from "leaflet";

interface LayerCounts {
  [key: string]: { visible: number; total: number };
}

interface LayerDef {
  id: string;        // id único para sidebar
  name: string;      // typename real (metrix:colonias, etc.)
  active: boolean;
  cql_filter?: string;
}

export function useCounts(map: L.Map | null, layers: LayerDef[]) {
  const [counts, setCounts] = useState<LayerCounts>({});

  // Cualquier cambio relevante en capas dispara el recálculo
  const layerSignature = useMemo(
    () => layers.map((l) => `${l.id}:${l.name}:${l.active}:${l.cql_filter ?? ""}`).join("|"),
    [layers]
  );

  // --- helpers WFS
  const fetchHits = async (name: string, cql?: string, bbox?: string) => {
    const url =
      `https://geoserver.soymetrix.com/geoserver/wfs` +
      `?service=WFS&version=1.1.0&request=GetFeature` +
      `&typename=${encodeURIComponent(name)}` +
      `&srsName=EPSG:4326&resultType=hits` +
      (bbox ? `&bbox=${bbox},EPSG:4326` : "") +
      (cql ? `&cql_filter=${encodeURIComponent(cql)}` : "");

    try {
      const res = await fetch(url);
      const text = await res.text();
      const match = text.match(/numberOfFeatures="(\d+)"/);
      return match ? parseInt(match[1], 10) : 0;
    } catch (err) {
      console.error("Error fetching WFS count:", err);
      return 0;
    }
  };

  const CANDIDATE_GEOMS = [
    "geom",
    "the_geom",
    "wkb_geometry",
    "msGeometry",
    "shape",
    "geometry",
  ];

  // Intenta visible usando BBOX dentro del CQL (para capas con filtro)
  const fetchVisibleWithCqlBbox = async (
    name: string,
    filter: string,
    b: L.LatLngBounds
  ) => {
    const minx = b.getWest();
    const miny = b.getSouth();
    const maxx = b.getEast();
    const maxy = b.getNorth();

    for (const g of CANDIDATE_GEOMS) {
      const cql = `(${filter}) AND BBOX(${g}, ${minx}, ${miny}, ${maxx}, ${maxy}, 'EPSG:4326')`;
      const n = await fetchHits(name, cql);
      if (n > 0) return n; // en cuanto dé > 0, devolvemos
    }
    return 0;
  };

  useEffect(() => {
    if (!map) return;

    const updateCounts = async () => {
      const b = map.getBounds();
      const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;

      const next: LayerCounts = {};
      for (const { id, name, active, cql_filter } of layers) {
        // total (igual que antes)
        const total = await fetchHits(name, cql_filter);

        // visible
        let visible = 0;
        if (active) {
          if (!cql_filter) {
            // capas sin filtro → rápido con bbox
            visible = await fetchHits(name, undefined, bbox);
          } else {
            // capas con filtro → 1) bbox param + cql
            visible = await fetchHits(name, cql_filter, bbox);

            // si no respondiera bien, 2) BBOX dentro del CQL
            if (visible === 0 && total > 0) {
              visible = await fetchVisibleWithCqlBbox(name, cql_filter, b);
            }
          }
        }

        next[id] = { visible, total };
      }
      setCounts(next);
    };

    updateCounts();
    map.on("moveend", updateCounts);
    return () => {
      map.off("moveend", updateCounts);
    };
  }, [map, layerSignature]);

  return counts;
}

