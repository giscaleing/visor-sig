// 📌 src/components/FeatureInfo.tsx
import { useState } from "react";
import { Popup, useMapEvents } from "react-leaflet";

interface FeatureInfoProps {
  showColonias: boolean;
  showIdentificate: boolean;
}

const FeatureInfo = ({ showColonias, showIdentificate }: FeatureInfoProps) => {
  const [popupData, setPopupData] = useState<any>(null);

  useMapEvents({
    click: async (e) => {
      const map = e.target;
      const { lat, lng } = e.latlng;

      // 🔹 Capas activas dinámicamente
      const activeLayers: string[] = [];
      if (showColonias) activeLayers.push("metrix:colonias");
      if (showIdentificate) activeLayers.push("metrix:identificate");

      if (activeLayers.length === 0) {
        setPopupData(null);
        return;
      }

      const bounds = map.getBounds();
      const size = map.getSize();
      const point = map.latLngToContainerPoint(e.latlng);

      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const width = size.x;
      const height = size.y;
      const i = Math.trunc(point.x);
      const j = Math.trunc(point.y);

      const url = `https://geoserver.soymetrix.com/geoserver/wms?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=${activeLayers.join(",")}&query_layers=${activeLayers.join(",")}&info_format=application/json&srs=EPSG:4326&bbox=${bbox}&width=${width}&height=${height}&x=${i}&y=${j}`;

      try {
        const response = await fetch(url);
        const text = await response.text();
        let props: any = null;

        try {
          const data = JSON.parse(text);
          if (data.features && data.features.length > 0) {
            props = data.features[0].properties;
          }
        } catch {
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "application/xml");
          const fields: Record<string, string> = {};

          xml.querySelectorAll("tr").forEach((row) => {
            const th = row.querySelector("th");
            const td = row.querySelector("td");
            if (th && td) fields[th.textContent || "campo"] = td.textContent || "";
          });

          if (Object.keys(fields).length === 0) fields["info"] = text;
          props = fields;
        }

        if (props) setPopupData({ lat, lng, props });
        else setPopupData(null);
      } catch (error) {
        console.error("Error en GetFeatureInfo:", error);
      }
    },
  });

  return popupData ? (
    <Popup position={[popupData.lat, popupData.lng]}>
      {Object.entries(popupData.props).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {String(value)}
        </div>
      ))}
    </Popup>
  ) : null;
};

export default FeatureInfo;
