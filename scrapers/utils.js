function convertirHora(hora){
    let res = hora.split("");
    res.splice(2, 0, ":");
    res = res.join("");

    return res;
}

export {
    convertirHora
}