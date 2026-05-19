# AGENTS.md - Reglas para Codex en App Bodas

## Proyecto

Este repositorio es App Bodas, una aplicación Vite + React + TypeScript para gestionar bodas, invitados, RSVP, mesas, música, alojamientos, desplazamientos, fotos, chat y backoffice.

## Stack

- Vite
- React
- TypeScript strict
- TailwindCSS
- React Router v6
- Futuro/actual integración parcial con Supabase

## Estructura funcional

La app tiene cuatro zonas principales:

1. Marketing público:
   - /
   - /demo
   - /pricing

2. Zona pública de boda:
   - /w/:slug
   - /w/:slug/programa
   - /w/:slug/rsvp
   - /w/:slug/rsvp/:token
   - /w/:slug/alojamientos
   - /w/:slug/desplazamientos
   - /w/:slug/mesas
   - /w/:slug/chat
   - /w/:slug/musica
   - /w/:slug/fotos

3. Panel admin de boda:
   - /w/:slug/admin
   - /w/:slug/admin/invitados
   - /w/:slug/admin/programa
   - /w/:slug/admin/alojamientos
   - /w/:slug/admin/desplazamientos
   - /w/:slug/admin/chat
   - /w/:slug/admin/presupuesto
   - /w/:slug/admin/ajustes
   - /w/:slug/admin/actividad
   - /w/:slug/admin/checklist
   - /w/:slug/admin/agenda
   - /w/:slug/admin/archivos
   - /w/:slug/admin/ceremonia

4. Backoffice interno:
   - /backoffice
   - /backoffice/dashboard
   - /backoffice/marketing
   - /backoffice/pricing
   - /backoffice/weddings
   - /backoffice/content
   - /backoffice/settings

## Roles

Hay tres roles principales:

1. Owner/Backoffice:
   - Gestión interna de la plataforma.
   - No debe mezclarse con el panel de novios.

2. Admin de boda:
   - Normalmente novios u organizadores.
   - Puede acceder a /w/:slug/admin.
   - Puede gestionar invitados, mesas, programa, ajustes, música, etc.

3. Invitado:
   - Solo accede a la zona pública/invitado.
   - Nunca debe entrar al panel admin.
   - Solo ve módulos abiertos/publicados por los admin.

## Reglas obligatorias

1. No romper rutas existentes.
2. No renombrar rutas públicas sin permiso.
3. No hacer refactor masivo sin pedir confirmación.
4. No eliminar archivos o servicios sin verificar que no se usan.
5. No mezclar demo con bodas reales.
6. No mezclar backoffice con panel admin de boda.
7. No tocar autenticación, roles o guards de forma amplia sin explicar riesgos.
8. No introducir dependencias nuevas sin justificarlo.
9. No usar `npm audit fix --force`.
10. No ejecutar `rm -rf`, `git reset --hard` ni `git clean -fd` sin autorización explícita.
11. Mantener TypeScript estricto.
12. Al terminar cualquier cambio, ejecutar `npm run build`.
13. Si el build falla, corregir solo lo necesario.
14. Entregar siempre resumen de cambios, archivos modificados, riesgos y siguiente paso.

## Prioridad actual

La prioridad actual es preparar migración parcial y segura a Supabase en staging:

1. Acceso real por boda.
2. Separar bypass dev fuera de staging/producción.
3. Definir auth/roles mínimos.
4. Conectar progresivamente bodas/slug/ajustes/programa.
5. Después invitados/RSVP/mesas.
6. Más adelante desplazamientos, gestión, presupuesto, actividad, chat, fotos y archivos.

## Forma de trabajo

Trabajar siempre de forma incremental:

1. Analizar.
2. Proponer.
3. Modificar poco.
4. Ejecutar build.
5. Explicar cambios.
6. Esperar revisión.

Una tarea debe tocar el menor número posible de archivos.