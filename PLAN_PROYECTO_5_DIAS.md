# ArtesaGest - Plan de Desarrollo (5 dias, 3 integrantes)

## Objetivo
Construir un prototipo funcional de **ArtesaGest** con HTML, CSS y JavaScript (vanilla), usando Git con flujo por ramas `feature/*`.

## Flujo Git recomendado
- Rama principal: `main`
- Rama de integracion: `develop`
- Ramas de trabajo: `feature/nombre-modulo`
- Correcciones: `fix/nombre-correccion`

### Comandos base por integrante
```bash
git checkout develop
git pull origin develop
git checkout -b feature/rf2-inventario-alertas
# cambios...
git add .
git commit -m "feat(inventario): agrega CRUD y alertas de stock"
git push -u origin feature/rf2-inventario-alertas
```

## Distribucion por 5 dias

### Dia 1 - Base del proyecto
- Integrante 1: estructura general, layout comun, navegacion.
- Integrante 2: base de inventario (tabla + formulario).
- Integrante 3: base de POS (catalogo + carrito inicial).

Ramas sugeridas:
- `feature/setup-base`
- `feature/rf2-inventario-base`
- `feature/rf4-pos-base`

### Dia 2 - Nucleo funcional
- Integrante 1: RF-1 autenticacion y roles.
- Integrante 2: RF-3 flujo de produccion (Corte, Lijado, Pintura, Terminado).
- Integrante 3: RF-4 POS completo (totales + confirmacion de venta).

Ramas sugeridas:
- `feature/rf1-auth-roles`
- `feature/rf3-produccion-workflow`
- `feature/rf4-pos-calculos`

### Dia 3 - Cobertura de brechas
- Integrante 1: RF-5 dashboard con KPIs.
- Integrante 2: RF-2 alertas de stock bajo + filtros.
- Integrante 3: RF-6 base de reportes (historial por fecha).

Ramas sugeridas:
- `feature/rf5-dashboard-kpis`
- `feature/rf2-alertas-stock`
- `feature/rf6-reportes-base`

### Dia 4 - RF-6 completo + extra
- Integrante 1: exportacion CSV (Blob API).
- Integrante 2: RF-7 contactos (clientes/proveedores).
- Integrante 3: flujo de caja (ingresos - costos = margen).

Ramas sugeridas:
- `feature/rf6-exportar-csv`
- `feature/rf7-contactos-crud`
- `feature/rf6-flujo-caja`

### Dia 5 - QA y entrega
- Integrante 1: responsive y pulido UI.
- Integrante 2: validaciones e integracion de datos.
- Integrante 3: README, capturas y evidencia.
- Todos: pruebas finales y PR `develop -> main`.

Ramas sugeridas:
- `fix/ui-responsive`
- `fix/integracion-datos`
- `docs/readme-entrega`

## Estructura sugerida del proyecto
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

## Checklist de cierre
- [ ] RF-1 Login y roles funcionando
- [ ] RF-2 CRUD inventario + alerta stock bajo
- [ ] RF-3 Estados de produccion completos
- [ ] RF-4 POS con total y guardado de ventas
- [ ] RF-5 Dashboard con KPIs
- [ ] RF-6 Reportes + flujo de caja + exportar CSV
- [ ] RF-7 Contactos (valor agregado)
- [ ] Pruebas finales y evidencia de funcionamiento

## Convencion de commits
- `feat:` nueva funcionalidad
- `fix:` correccion
- `docs:` documentacion
- `refactor:` mejora interna

Ejemplos:
- `feat(auth): implementa login con roles en localStorage`
- `feat(reportes): agrega exportacion CSV y flujo de caja`
- `fix(pos): corrige calculo de total en carrito`
