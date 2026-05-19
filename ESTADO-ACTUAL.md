# ESTADO ACTUAL - App Bodas

## Situación actual

El proyecto App Bodas está en desarrollo activo.

Stack:
- Vite
- React
- TypeScript
- Tailwind
- React Router

## Objetivo inmediato

Preparar la app para una migración parcial a Supabase sin romper la versión actual.

## Prioridades actuales

1. Revisar acceso por boda mediante slug.
2. Separar bypass dev solo para entorno local.
3. Bloquear bypass en staging/producción.
4. Revisar roles mínimos:
   - Backoffice
   - Admin boda
   - Invitado
5. Conectar gradualmente datos reales:
   - bodas
   - ajustes
   - programa
   - invitados
   - RSVP
   - mesas

## Pendiente importante

- Activar identificación real del invitado.
- Crear logs de actividad.
- Crear sistema robusto de confirmación de asistencia.
- Crear home del invitado.
- Bloquear panel admin para invitados.
- Estilizar app pública.
- Implementar chat de invitados.
- Considerar migración futura a Supabase según evolución.

## Regla de avance

No avanzar muchas zonas a la vez. Cada mejora debe hacerse en ramas pequeñas y con build correcto.