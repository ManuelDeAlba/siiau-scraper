import fetch from 'node-fetch';
import cheerio from 'cheerio';

import { convertirHora } from "./utils.mjs";

async function obtenerCiclos(){
    let res = await fetch(`http://consulta.siiau.udg.mx/wco/sspseca.forma_consulta`);
    let html = await res.text();

    let $ = cheerio.load(html);

    let listaCiclos = [];
    let $opciones = $("#cicloID option");

    $opciones.each((_, opcion) => {
        let [ciclo, descripcion] = $(opcion).text().trim().split(" - ");
        listaCiclos.push({
            ciclo,
            descripcion
        });
    })

    return listaCiclos;
}

async function obtenerCentros(){
    let res = await fetch(`http://consulta.siiau.udg.mx/wco/sspseca.forma_consulta`);
    let html = await res.text();

    let $ = cheerio.load(html);

    let listaCentros = [];
    let $opciones = $("select[name=cup] option");

    $opciones.each((_, opcion) => {
        let [centro, descripcion] = $(opcion).text().trim().split(" - ");
        listaCentros.push({
            centro,
            descripcion
        });
    })

    return listaCentros;
}

async function obtenerCarrerasPorCentro(centro = ""){
    if(centro === "") return {error: "Centro universitario requerido, usa obtenerCentros para ver los códigos (obtenerCarrerasPorCentro)"};

    let res = await fetch(`http://consulta.siiau.udg.mx/wco/sspseca.lista_carreras?cup=${centro}`, {
        method: "post",
    })
    let html = await res.text();

    let $ = cheerio.load(html);
    
    // Obtenemos de la primera tabla solo las filas que contienen celdas con datos para evitar los titulos
    let $filas = $("table:first-of-type tr:has(td)");
    let carreras = [];

    $filas.each((_, fila) => {
        // Buscamos el texto de los "a" (contienen el codigo de carrera)
        let carrera = $(fila).find("a").text();
        // Buscamos las celdas que no tienen "a" (contienen el nombre completo)
        let descripcion = $(fila).find("td:not(:has(a))").text();

        // Guardamos los datos
        carreras.push({
            carrera,
            descripcion
        });
    })

    return carreras;
}

async function obtenerClases({ciclo, centro, carrera, clave}){
    if(!ciclo || !centro || !carrera || !clave) return {error: "Datos requeridos {ciclo, centro, carrera, clave} (obtenerClases)"};
    /*
        ciclop -> 202310 = 2023 A
        cup -> D = CUCEI
        majrp -> INNI = Informática
        crsep -> I5908 = Clave
        ordenp -> 0 = Ordenar por materia
        mostrarp -> 500
    */
    let res = await fetch(`http://consulta.siiau.udg.mx/wco/sspseca.consulta_oferta?ciclop=${ciclo}&cup=${centro}&majrp=${carrera}&crsep=${clave}&ordenp=0&mostrarp=500`, {
        method: "post",
    });
    let html = await res.text();

    let $ = cheerio.load(html);

    let $filas = $("table tr:has(.tddatos)");
    let clases = [];

    $filas.each((_, fila) => {
        let NRC = $(fila).find(".tddatos:nth-child(1)").text();
        let clave = $(fila).find(".tddatos:nth-child(2)").text();
        let materia = $(fila).find(".tddatos:nth-child(3)").text();
        let seccion = $(fila).find(".tddatos:nth-child(4)").text();
        let creditos = $(fila).find(".tddatos:nth-child(5)").text();
        let cuposTotales = $(fila).find(".tddatos:nth-child(6)").text();
        let cuposDisponibles = $(fila).find(".tddatos:nth-child(7)").text();

        let calendario = {}
        $(fila).find("td table tr:not(:has(.tdprofesor))").each((_, el) => {
            calendario.ses = $(el).find("td:nth-child(1)").text();

            // Obtener hora y cambiar formato
            let [ horaInicio, horaFin ] = $(el).find("td:nth-child(2)").text().split("-");
            calendario.hora = {
                inicio: convertirHora(horaInicio),
                fin: convertirHora(horaFin)
            };

            calendario.dias = $(el).find("td:nth-child(3)").text().replace(/[\.|\s]/g, "").split("");
            calendario.edificio = $(el).find("td:nth-child(4)").text();
            calendario.aula = $(el).find("td:nth-child(5)").text();

            let [ fechaInicio, fechaFin] = $(el).find("td:nth-child(6)").text().split(" - ");
            calendario.fechas = {
                inicio: fechaInicio,
                fin: fechaFin
            };
        });

        let profesor = $(fila).find(".tdprofesor:nth-child(2)").text();

        clases.push({
            nrc: NRC,
            clave,
            materia,
            seccion,
            creditos,
            cuposTotales,
            cuposDisponibles,
            calendario,
            profesor
        });
    })

    return clases;
}

export {
    obtenerCiclos,
    obtenerCentros,
    obtenerCarrerasPorCentro,
    obtenerClases
}