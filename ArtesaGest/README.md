# ArtesaGest

Sistema integrado de inventario y control de ventas para talleres artesanales.

## Descripcion
ArtesaGest es un proyecto academico desarrollado con **HTML5, CSS3 y JavaScript (vanilla)** para centralizar:
- Control de inventario de materia prima
- Seguimiento de ordenes de produccion
- Punto de venta (POS)
- Dashboard con indicadores
- Reportes de ventas y flujo de caja

## Integrantes
- Integrante 1: Auth, estructura e integracion
- Integrante 2: Inventario y produccion
- Integrante 3: POS, dashboard y reportes

## Tecnologias
- HTML5
- CSS3 (Flexbox/Grid)
- JavaScript ES6 (sin frameworks)
- localStorage (persistencia local)
- Chart.js (CDN) para graficas

## Estructura del proyecto
```text
ArtesaGest/
  index.html
  dashboard.html
  inventario.html
  produccion.html
  pos.html
  reportes.html
  contactos.html
  css/
    styles.css
    components.css
  js/
    data.js
    auth.js
    dashboard.js
    inventario.js
    produccion.js
    pos.js
    reportes.js
    contactos.js
```

## Requisitos funcionales
- RF-1: Autenticacion con roles (admin y artesano)
- RF-2: Gestion de inventario de materia prima (CRUD + alerta stock)
- RF-3: Ordenes de produccion (Corte, Lijado, Pintura, Terminado)
- RF-4: Punto de venta (POS)
- RF-5: Dashboard con KPIs
- RF-6: Reportes, flujo de caja y exportacion CSV
- RF-7 (valor agregado): Gestion de contactos

## Como ejecutar
1. Clonar o descargar el proyecto.
2. Abrir la carpeta `ArtesaGest`.
3. Ejecutar `index.html` en el navegador (doble clic).

No requiere instalacion de dependencias ni backend.

## Credenciales de prueba
- Usuario: `admin` | Contrasena: `123456`
- Usuario: `artesano` | Contrasena: `123456`

## Flujo Git del equipo
- Rama estable: `main`
- Rama de integracion: `develop`
- Ramas por funcionalidad: `feature/*`
- Correcciones: `fix/*`

Ejemplo:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/rf2-inventario-alertas
git add .
git commit -m "feat(inventario): agrega CRUD y alertas"
git push -u origin feature/rf2-inventario-alertas
```

## Criterios de aceptacion (resumen)
- Login funcional y control visual por rol.
- CRUD de inventario con alerta de stock bajo.
- Flujo completo de estados de produccion.
- Venta registrada desde POS con calculo correcto de total.
- KPIs visibles en dashboard.
- Reportes con filtro por fecha, flujo de caja y descarga CSV.

## Evidencias sugeridas para entrega
- Captura de login exitoso (admin y artesano).
- Captura de inventario con alerta de stock bajo.
- Captura de orden en cada estado de produccion.
- Captura de venta confirmada en POS.
- Captura de dashboard con KPIs.
- Captura de reporte filtrado y archivo CSV descargado.

## Limitaciones del prototipo
- Persistencia local en navegador (`localStorage`).
- Sin backend ni base de datos real.
- No apto para entorno productivo multiusuario.

## Licencia
Uso academico.
