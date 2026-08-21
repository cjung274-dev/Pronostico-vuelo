# Pronóstico de Vuelo RPAS — Evaluador de Condiciones Operacionales

**Aplicación web para pilotos RPAS que evalúa las condiciones meteorológicas y geofísicas en tiempo real y entrega un veredicto operacional: `APTO` / `PRECAUCIÓN` / `NO APTO`.**

Diseñada para el chequeo previo al vuelo bajo el marco normativo chileno **DAN 151 Ed.4 (DGAC, abril 2026)**, con especial atención a la operación nocturna (VNOC).

🔗 **[Abrir la aplicación](https://cjung274-dev.github.io/Pronostico-vuelo/)**

---

## El problema

Antes de cada vuelo, el piloto al mando debe verificar que las condiciones sean seguras (DAN 151, art. 151.103.d). En la práctica eso significa cruzar mentalmente media docena de fuentes distintas —clima, visibilidad, punto de rocío, actividad geomagnética— bajo presión de tiempo, con frecuencia de noche y con conectividad marginal en terreno.

Esta aplicación consolida esa verificación en una sola pantalla, con criterios explícitos, trazables y auditables. El veredicto nunca es una caja negra: junto al resultado aparece siempre qué factor lo provocó y con qué valor.

Es agnóstica al tipo de operación. Inspección, vigilancia, cartografía, respuesta a emergencias, fotografía profesional o vuelo recreativo responsable comparten el mismo problema de fondo: decidir si hoy, aquí y ahora, se vuela.

---

## Qué evalúa

Siete factores independientes, cada uno con umbral de precaución y umbral de no-vuelo:

| Factor | Precaución | No apto | Fundamento |
|---|---|---|---|
| **Viento sostenido** | ≥ 22 km/h | ≥ 35 km/h | Resistencia al viento declarada por el fabricante |
| **Ráfaga** | ≥ 28 km/h | ≥ 40 km/h | Ídem, con margen por transitorios |
| **Visibilidad** | < 6 km | < 3 km | Requisito VMC |
| **Margen a punto de rocío** | Δ ≤ 2.5 °C | Δ ≤ 1.5 °C | Riesgo de niebla y condensación |
| **Temperatura ambiente** | ≤ 8 °C | ≤ 2 °C | Condensación en superficies + degradación LiPo |
| **Índice Kp geomagnético** | > 3 | > 4 | Degradación de GNSS/brújula |
| **Prob. de precipitación** | ≥ 20 % | ≥ 50 % | Integridad del equipo |

Todos los umbrales son **configurables** desde la propia aplicación. Los valores por defecto son un punto de partida conservador, no un estándar: cada operador debe ajustarlos a su aeronave, su procedimiento y su entorno.

### Ajuste automático día/noche

La app detecta amanecer y atardecer reales de la ubicación y **endurece los umbrales en modo nocturno**: menos viento tolerado, más visibilidad exigida, mayor margen a punto de rocío. Sin luz natural, los márgenes de error son otros.

### El factor temperatura: por qué existe

La mayoría de los modelos evalúan riesgo de condensación únicamente por el margen al punto de rocío. En operación real se observó que **entre 7 y 8 °C aparece condensación sobre superficies (carrocería, hélices, sensores) aun con margen de rocío aparentemente aceptable** — las superficies se enfrían por radiación más rápido que el aire circundante. A eso se suma la caída de capacidad y el aumento de tasa de descarga de baterías LiPo con frío, más marcado en equipos con ciclos acumulados.

Por eso la temperatura ambiente es un **factor independiente**, no derivado del punto de rocío. Es un umbral derivado de terreno, no de manual.

---

## Clasificación de aeronaves (Apéndice G, DAN 151)

La app calcula la **categoría de severidad S1–S5** de cada aeronave registrada a partir de su energía cinética de impacto (½·m·v²), usando la velocidad terminal de caída estimada para multirrotores y la velocidad declarada para ala fija.

| Categoría | Energía de impacto |
|---|---|
| S1 | ≤ 15 J |
| S2 | ≤ 50 J |
| S3 | ≤ 80 J |
| S4 | ≤ 250 J |
| S5 | > 250 J |

Esta categoría se cruza con el nivel de exposición de personas del área (E1–E5) en la matriz de aceptabilidad de la norma para determinar qué operaciones sobre personas son admisibles.

**Catálogo de 28 modelos DJI** con pesos y diagonales de fábrica, agrupados en cinco familias: Matrice enterprise (400, 350 RTK, 300 RTK, 30/30T, 4T/4E, 4D/4TD), Mavic Enterprise (3T, 3TA, 3E, Mavic 2 Enterprise Dual), Mavic/Air/Mini/Phantom/Inspire, FPV y compactos, y Agras agrícolas. Cualquier aeronave puede ingresarse manualmente; los presets solo rellenan los campos.

Seis modelos aparecen marcados con asterisco: DJI no publica *diagonal wheelbase* para ellos y el valor se derivó de las dimensiones desplegadas declaradas. La app lo advierte al seleccionarlos.

**Nota sobre la sensibilidad de la fórmula.** El límite S1/S2 (15 J) cae muy cerca de la energía típica de los multirrotores de 249 g, de modo que diferencias de pocos milímetros en la diagonal pueden mover un modelo de categoría. No es un defecto del cálculo, sino una propiedad de la frontera: en clasificaciones cercanas a un umbral conviene documentar el área proyectada usada y su origen.

---

## Funcionalidades

**Evaluación en tiempo real**
- Panel de estado con veredicto y motivos explícitos
- Desglose colapsable de los factores con valor actual y estado individual
- Franja de pronóstico de 24 horas con semáforo por hora
- Brújula con rosa cardinal completa, flecha de viento (convención meteorológica) y aguja sincronizada al giroscopio del teléfono, con compensación de inclinación
- Fase lunar calculada offline (relevante para VLOS nocturno)

**Modo nocturno / VNOC**
- Detección automática por amanecer/atardecer reales
- Panel de requisitos VNOC según art. 151.105(a): credencial habilitada, procedimiento de vigilancia aérea aprobado, límite de 300 ft / 100 m, luces visibles a ≥ 500 m, sensores de obstáculos y observador habilitado

**Bitácora operacional**
- Sistema de turnos con registro de operador y cargo
- Registro de vuelos con snapshot de condiciones al momento del registro
- Reporte HTML automático al cierre de turno
- Exportación por ciclo, agrupando múltiples turnos por rango de fechas y etiqueta
- Respaldo completo exportable/importable

**Referencia normativa**
- Panel colapsable con artículos citados de DAN 151 Ed.4, incluyendo alcance (151.003), verificación previa (151.103.d) y requisitos de vuelo nocturno (151.105.a)

---

## Arquitectura

**Sin backend. Sin base de datos. Sin cuenta de usuario.**

Un único archivo `index.html` (~2460 líneas) con HTML, CSS y JavaScript vanilla. Sin framework, sin paso de compilación, sin dependencias de npm.

### Decisiones de diseño

**Offline-first como requisito de seguridad, no como limitación.**
La aplicación se usa en terreno, donde la cobertura es irregular. Toda la persistencia (turnos, bitácora, aeronaves, umbrales) vive en `localStorage` del dispositivo. Ningún dato operacional sale del teléfono: no hay telemetría, no hay analítica, no hay servidor propio que comprometer. La superficie de ataque se reduce a las APIs públicas de consulta, y el registro de operaciones —que puede ser información sensible— nunca abandona el equipo del piloto.

**Degradación en cascada.**
Cada fuente externa tiene respaldo, y la ausencia de una fuente nunca bloquea la pantalla:

| Dato | Fuente primaria | Respaldo |
|---|---|---|
| Meteorología | Open-Meteo | — (dato crítico, falla explícita) |
| Índice Kp | NOAA SWPC | GFZ Potsdam → proxy CORS |
| Geocodificación inversa | BigDataCloud | OpenStreetMap Nominatim |
| Ubicación | Geolocation API | Coordenada fija configurable |

El clima se renderiza de inmediato y el Kp se incorpora después, en segundo plano — un índice geomagnético lento no debe retrasar una decisión de despegue.

**PWA instalable.** `manifest.json` + service worker: se instala como aplicación en la pantalla de inicio y conserva la última vista disponible sin conexión.

**Tema doble.** Modo oscuro por defecto (operación nocturna, preservación de visión escotópica) y modo claro para operación diurna, mediante custom properties de CSS.

### Stack

```
HTML5 · CSS3 (custom properties) · JavaScript ES6+ (vanilla)
html2canvas — exportación de reportes a PNG
Inter + IBM Plex Mono — tipografía de interfaz y de datos
GitHub Pages — despliegue
```

---

## Fuentes de datos

| Servicio | Uso | Licencia |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | Meteorología horaria y efemérides solares | Gratuita, sin API key |
| [NOAA SWPC](https://www.swpc.noaa.gov/) | Índice Kp planetario (operacional) | Dominio público |
| [GFZ Potsdam](https://www.gfz-potsdam.de/) | Índice Kp (institución definidora) | Uso científico abierto |
| [BigDataCloud](https://www.bigdatacloud.com/) | Geocodificación inversa | Free tier |
| [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) | Geocodificación inversa (respaldo) | ODbL |

---

## Instalación

No requiere instalación. Abrir la [URL de la aplicación](https://cjung274-dev.github.io/Pronostico-vuelo/) en el navegador del teléfono y, opcionalmente, usar *Añadir a pantalla de inicio* para instalarla como PWA.

Para desplegar una copia propia: cualquier hosting estático con HTTPS sirve. HTTPS es obligatorio — sin él, el navegador bloquea la geolocalización.

```bash
git clone https://github.com/cjung274-dev/Pronostico-vuelo.git
```

Los cuatro archivos (`index.html`, `manifest.json`, `sw.js`, `icon.svg`) van al raíz del sitio.

---

## Alcance y limitaciones

Esta aplicación es una **herramienta de apoyo a la decisión**. No sustituye el juicio del piloto al mando, la inspección visual del sitio, ni la consulta de fuentes oficiales de información aeronáutica. La responsabilidad de la operación es siempre del piloto.

- Los datos meteorológicos provienen de modelos de pronóstico, no de estaciones en el punto exacto de operación.
- Los umbrales por defecto son un punto de partida; deben ajustarse a cada aeronave y contexto operacional.
- **El Índice Kp forma parte del temario teórico obligatorio de meteorología (Apéndice E, DAN 151), pero la norma no fija un umbral operacional sobre él.** La aplicación lo muestra como referencia de buena práctica internacional, no como exigencia DGAC.
- La app **no** verifica espacio aéreo, NOTAM, zonas restringidas, autorizaciones ni coordinación con otros usuarios del espacio aéreo. Eso sigue siendo responsabilidad del piloto.
- La aeronavegabilidad del equipo y la vigencia de credenciales están fuera de alcance.
- Las clasificaciones S1–S5 son un cálculo de apoyo. Para documentación presentada ante la autoridad, verificar los parámetros de entrada contra la ficha del fabricante.

---

## Estado

En uso operacional. Desarrollada e iterada íntegramente desde un dispositivo Android.

---

## Licencia

Por definir.

---

## Referencias normativas

- **DAN 151 Ed.4** — *Operaciones de Aeronaves Pilotadas a Distancia (RPAS) en Asuntos de Interés Público* — DGAC Chile, abril 2026. Reemplaza a la Ed.3 (mayo 2024).
  - 151.003 — Alcance
  - 151.005.e — Registro de operador
  - 151.103.d — Verificación de condiciones seguras previa al vuelo
  - 151.105.a — Requisitos de operación nocturna (VNOC)
  - Apéndice E — Temario teórico de meteorología
  - Apéndice G — Clasificación de severidad S1–S5 y matriz de aceptabilidad
