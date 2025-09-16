// src/utils/buildSldStyle.ts
import { LayerStyle, GeometryType } from "../components/SymbologyModal";

export default function buildSldStyle(
  style: LayerStyle,
  geometryType: GeometryType = "polygon",
  layerName: string = "layer" // 👈 dinámico por capa
) {
  if (geometryType === "point") {
    return `
      <StyledLayerDescriptor version="1.0.0"
        xmlns="http://www.opengis.net/sld"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <NamedLayer>
          <Name>${layerName}</Name>
          <UserStyle>
            <FeatureTypeStyle>
              <Rule>
                <PointSymbolizer>
                  <Graphic>
                    <Mark>
                      <WellKnownName>circle</WellKnownName>
                      <Fill>
                        <CssParameter name="fill">${style.fillColor}</CssParameter>
                        <CssParameter name="fill-opacity">${style.fillOpacity}</CssParameter>
                      </Fill>
                      <Stroke>
                        <CssParameter name="stroke">${style.strokeColor}</CssParameter>
                        <CssParameter name="stroke-opacity">${style.strokeOpacity}</CssParameter>
                        <CssParameter name="stroke-width">${style.strokeWidth}</CssParameter>
                      </Stroke>
                    </Mark>
                    <Size>${style.radius || 6}</Size>
                  </Graphic>
                </PointSymbolizer>
              </Rule>
            </FeatureTypeStyle>
          </UserStyle>
        </NamedLayer>
      </StyledLayerDescriptor>
    `;
  }

  if (geometryType === "line") {
    return `
      <StyledLayerDescriptor version="1.0.0"
        xmlns="http://www.opengis.net/sld"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:xlink="http://www.opengis.net/xlink"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <NamedLayer>
          <Name>${layerName}</Name>
          <UserStyle>
            <FeatureTypeStyle>
              <Rule>
                <LineSymbolizer>
                  <Stroke>
                    <CssParameter name="stroke">${style.strokeColor}</CssParameter>
                    <CssParameter name="stroke-opacity">${style.strokeOpacity}</CssParameter>
                    <CssParameter name="stroke-width">${style.strokeWidth}</CssParameter>
                  </Stroke>
                </LineSymbolizer>
              </Rule>
            </FeatureTypeStyle>
          </UserStyle>
        </NamedLayer>
      </StyledLayerDescriptor>
    `;
  }

  // 🔹 Polígonos (default)
  return `
    <StyledLayerDescriptor version="1.0.0"
      xmlns="http://www.opengis.net/sld"
      xmlns:ogc="http://www.opengis.net/ogc"
      xmlns:xlink="http://www.opengis.net/xlink"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <NamedLayer>
        <Name>${layerName}</Name>
        <UserStyle>
          <FeatureTypeStyle>
            <Rule>
              <PolygonSymbolizer>
                <Fill>
                  <CssParameter name="fill">${style.fillColor}</CssParameter>
                  <CssParameter name="fill-opacity">${style.fillOpacity}</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">${style.strokeColor}</CssParameter>
                  <CssParameter name="stroke-opacity">${style.strokeOpacity}</CssParameter>
                  <CssParameter name="stroke-width">${style.strokeWidth}</CssParameter>
                </Stroke>
              </PolygonSymbolizer>
            </Rule>
          </FeatureTypeStyle>
        </UserStyle>
      </NamedLayer>
    </StyledLayerDescriptor>
  `;
}


