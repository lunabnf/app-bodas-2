# README-CODEX - Contexto de App Bodas

## Qué es App Bodas

App Bodas es una aplicación web para digitalizar la experiencia de una boda.

Sirve para:

- Crear una boda digital.
- Tener una web pública por boda.
- Gestionar invitados.
- Confirmar asistencia mediante RSVP.
- Organizar mesas.
- Proponer y votar música.
- Informar sobre alojamientos.
- Informar sobre desplazamientos.
- Mostrar programa de la boda.
- Compartir fotos.
- Tener chat de invitados.
- Gestionar la boda desde un panel admin.
- Gestionar la plataforma desde un backoffice interno.

## Objetivo de producto

La app debe poder venderse a parejas/organizadores como una solución digital para bodas.

Tiene que tener:

- Parte pública bonita.
- Panel de novios claro.
- Invitados con acceso sencillo.
- Backoffice privado para gestión interna.
- Posibilidad futura de planes/precios.
- Posibilidad futura de varias bodas reales.

## Estado técnico

El proyecto funciona en local con Vite + React + TypeScript.

Hay servicios locales/localStorage y una integración parcial o futura con Supabase.

La prioridad no es migrarlo todo de golpe, sino preparar una transición segura.

## Reglas de producto

- Una boda debe estar aislada de otra.
- Cada boda se identifica por slug.
- Los invitados no deben ver paneles admin.
- Los novios/admin no deben confundirse con backoffice.
- La demo no debe mezclarse con bodas reales.
- El sistema debe poder crecer a SaaS.

## Qué evitar

- Refactors grandes.
- Cambios visuales innecesarios.
- Cambios de rutas.
- Eliminar compatibilidad.
- Crear datos duplicados.
- Crear dos fuentes de verdad para invitados, RSVP o mesas.