# 🌍 Visor SIG

Un visor web de información geográfica desarrollado con **React, TypeScript, Leaflet, PostGIS y GeoServer**.  
Permite visualizar, consultar y aplicar simbología dinámica a capas geográficas mediante servicios OGC (WMS/WFS).

---

## 🚀 Tecnologías principales

- **Frontend:** React 18 + TypeScript + Vite/CRA
- **Mapa:** Leaflet + React-Leaflet
- **Backend GIS:** GeoServer (WMS, WFS)
- **Base de datos:** PostgreSQL + PostGIS
- **Estilos:** SLD dinámicos (generados en frontend y enviados a GeoServer)

---

## ⚙️ Funcionalidades principales

- 📌 **Gestión de capas**: activar/desactivar capas desde el panel lateral.  
- 🎨 **Simbología dinámica**: cambiar colores, opacidad y grosor de borde en tiempo real.  
- 🔎 **Filtros por atributo**: construir filtros `CQL_FILTER` sobre columnas de las capas.  
- 📊 **Tabla de atributos**: abrir registros con paginación desde WFS.  
- 🔄 **Conteo optimizado**: cálculo de entidades visibles vs. totales mediante `resultType=hits`.  
- 📍 **Compatibilidad espacial**: soporte para geometrías tipo polígono y punto (símbolos circulares).  

---

## 📂 Estructura básica

```
src/
 ├── components/        # Componentes React (mapa, sidebars, modales)
 ├── hooks/             # Hooks personalizados (useCounts, etc.)
 ├── sld/               # Constructores dinámicos de estilos SLD
 ├── utils/             # Funciones auxiliares
 ├── App.tsx            # Punto de entrada principal
 └── index.tsx          # Renderizado inicial
```

---

## 🛠️ Instalación y uso

1. Clona el repositorio:

```bash
git clone https://github.com/giscaleing/visor-sig.git
cd visor-sig
```

2. Instala dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Abre en tu navegador:  
👉 [http://localhost:5173](http://localhost:5173)

---

## 🔮 Próximos pasos

- [ ] Mejorar UX en filtros (multiselección y limpieza).  
- [ ] Persistencia temporal de filtros aplicados.  
- [ ] Operaciones espaciales (buffer, intersección, selección por área).  
- [ ] Pruebas automáticas en React con datos WFS.  

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT – puedes usarlo y adaptarlo libremente.  

---

✍️ Desarrollado por **Giscale Ing. Topográfica**  
