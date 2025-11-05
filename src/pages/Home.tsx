export default function Home() {
  return (
    <section className="max-w-3xl mx-auto text-center space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold">Una app, tan real como necesaria</h1>
      <p className="text-lg leading-relaxed text-gray-800">
        Esta aplicación nació de una historia muy especial. En 2017 presenté a dos amigos que,
        con el paso del tiempo, se enamoraron y acabaron casándose en 2025. Quise ayudarles a que
        todo lo relacionado con su boda fuese más sencillo, organizado y bonito. El objetivo era
        que pudieran disfrutar del proceso sin tanto estrés, dedicando más tiempo a compartir
        momentos con los suyos y menos a los preparativos, para que así todo saliera perfecto.
      </p>
      <p className="text-lg leading-relaxed text-gray-800">
        Más adelante aquí se explicará cómo funciona la página, cómo crear tu propia webapp de boda
        y cómo aprovechar todas las herramientas que ofrece esta aplicación.
      </p>
      <hr className="my-8 border-white/30" />
      <div className="text-left space-y-4">
        <h2 className="text-2xl font-semibold text-center">Cómo instalarla como WebApp en tu móvil</h2>
        <details className="bg-white/10 rounded p-4">
          <summary className="cursor-pointer font-medium">iPhone / iPad (Safari)</summary>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Abre esta web en Safari.</li>
            <li>Toca el botón <span className="italic">Compartir</span> (cuadrado con flecha hacia arriba).</li>
            <li>Desplázate y pulsa <strong>Añadir a pantalla de inicio</strong>.</li>
            <li>Opcional: cambia el nombre que verás en el icono.</li>
            <li>Pulsa <strong>Añadir</strong>. La app quedará como si fuera una app nativa.</li>
          </ol>
        </details>
        <details className="bg-white/10 rounded p-4">
          <summary className="cursor-pointer font-medium">Android (Chrome)</summary>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Abre esta web en Google Chrome.</li>
            <li>Toca el menú ⋮ en la esquina superior derecha.</li>
            <li>Pulsa <strong>Añadir a pantalla de inicio</strong> o <strong>Instalar app</strong>.</li>
            <li>Confirma en el diálogo y espera a que se cree el icono.</li>
          </ol>
        </details>
        <p className="text-sm text-gray-800/90">
          Consejo: al abrirla desde el icono, la verás a pantalla completa, sin barra de dirección, y se actualizará sola cuando publiquemos mejoras.
        </p>
      </div>
    </section>
  );
}