function sololetras(e){
    key=e.keyCode || e.which;

    teclado=String.fromCharCode(key).toLowerCase();

    letras = " abcdefghijklmnñopqrstuvwxyzáéíóúABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚ";

    especiales="8-37-38-46-164";

    teclado_especial=false;

    for(var i in especiales){
        if(key==especiales[i]){
            teclado_especial=true;break
        }
    }

    if(letras.indexOf(teclado) ==-1 && !teclado_especial){
        return false;
    }

}


function solonumeros(e){
    key=e.keyCode || e.which;

    teclado=String.fromCharCode(key);

    letras="1234567890";

    especiales="8-37-38-46";

    teclado_especial=false;

    for(var i in especiales){
        if(key==especiales[i]){
            teclado_especial=true;break
        }
    }

    if(letras.indexOf(teclado) ==-1 && !teclado_especial){
        return false;
    }

}




function soloNumerosYGuiones(e) {
    key = e.keyCode || e.which;
    teclado = String.fromCharCode(key);
    numeros = "1234567890-"; // Permitir números y guiones ("-")
    especiales = "8-37-38-46";
    teclado_especial = false;

    for (var i in especiales) {
        if (key == especiales[i]) {
            teclado_especial = true;
            break;
        }
    }

    if (numeros.indexOf(teclado) === -1 && !teclado_especial) {
        return false;
    }
}


