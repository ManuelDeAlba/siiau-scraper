# Siiau Scraper

## Importación
```js
import { obtenerCiclos, obtenerCentros, obtenerCarrerasPorCentro, obtenerClases } from "./scrapers/index.js";
```

## Documentación
### obtenerCiclos();
Obtiene los códigos de los ciclos escolares y las descripciones
```js
let ciclos = await obtenerCiclos();
console.log(ciclos);

/*
  response => [{ ciclo: '2023X', descripcion: 'Calendario 23X Cuatrimestre' }, ...]
*/
```

### obtenerCentros();
Obtiene los códigos de los centros universitarios y su nombre
```js
let centros = await obtenerCentros();
console.log(centros);

/*
  response => [{ centro: '...', descripcion: '...' }, ...]
*/
```

### obtenerCarrerasPorCentro(centro);
Obtiene las carreras disponibles en el centro universitario
Para obtener los centros, utilizar obtenerCentros()
```js
let carreras = await obtenerCarrerasPorCentro("D"); // D - CUCEI
console.log(carreras);

/*
  response => [{ carrera: '...', descripcion: '...' }, ...]
*/
```

### obtenerClases(configuracion);
Obtiene la información de las clases en la oferta educativa
```js
let clases = await obtenerClases({
    ciclo: "202310", // Clave de ciclo
    centro: "D", // Clave de centro universitario
    carrera: "INNI", // Clave de carrera
    clave: "I5890" // Clave de materia
});
console.log(clases);

/*
  response => [{
    nrc: '...',
    clave: '...',
    materia: '...',
    seccion: '...',
    creditos: '...',
    cuposTotales: '...',
    cuposDisponibles: '...',
    calendario: {
      ses: '...',
      hora: { inicio: '...', fin: '...' },
      dias: [ '...', ...? ],
      edificio: '...',
      aula: '...',
      fechas: { inicio: '...', fin: '...' }
    },
    profesor: '...'
  }, ...]
*/
```