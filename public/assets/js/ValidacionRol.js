const roles = [
    {
        nombre:"Administrador",
        estado:"Activo"
    },
    {
        nombre:"Gerente",
        estado:"Activo"
    },
    {
        nombre:"Contador",
        estado:"Activo"
    },
    {
        nombre:"Cliente",
        estado:"Activo"
    }
]

const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

const expresiones = {
	usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, numeros, guion y guion_bajo
	nombre: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // Letras y espacios, pueden llevar acentos.
	password: /^.{4,12}$/, // 4 a 12 digitos.
	correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
	telefono: /^\d{7,14}$/ // 7 a 14 numeros.
}

const campos = {
	nombreRol: false,
}

const validarFormulario = (e) => {
	switch (e.target.name) {
		case "nombreRol":
			validarCampo(expresiones.nombre, e.target, 'nombreRol');
		break;
	}
}

const validarCampo = (expresion, input, campo) => {
	if(expresion.test(input.value)){
		document.getElementById(`grupo__${campo}`).classList.remove('formulario__grupo-incorrecto');
		document.getElementById(`grupo__${campo}`).classList.add('formulario__grupo-correcto');
		document.querySelector(`#grupo__${campo} i`).classList.add('fa-check-circle');
		document.querySelector(`#grupo__${campo} i`).classList.remove('fa-times-circle');
		document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.remove('formulario__input-error-activo');
    
		campos[campo] = true;
	} else {
		document.getElementById(`grupo__${campo}`).classList.add('formulario__grupo-incorrecto');
		document.getElementById(`grupo__${campo}`).classList.remove('formulario__grupo-correcto');
		document.querySelector(`#grupo__${campo} i`).classList.add('fa-times-circle');
		document.querySelector(`#grupo__${campo} i`).classList.remove('fa-check-circle');
		document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.add('formulario__input-error-activo');
		campos[campo] = false;
	}
}



inputs.forEach((input) => {
	input.addEventListener('keyup', validarFormulario);
	input.addEventListener('blur', validarFormulario);
});

formulario.addEventListener('submit', (e) => {
	e.preventDefault();

})


const getRol = () => {
    let nombre = document.querySelector('#nombreRol').value
    let estado = document.querySelector('#estadoRol').value
    if(nombre=="" || nombre==null || estado=="" || estado==null){
        Swal.fire({
            icon: 'error',
            title: 'Todos los campos son obligatorios'
          })
    }else{
        return new Promise( (resolve, reject) => {
            let encontrado = false
            roles.forEach(rol => {
                if(rol.nombre==nombre){
                    encontrado = true
                }
            })
           if (encontrado == true) {
            resolve( Swal.fire({
                icon: 'error',
                title: 'Rol ya existente'
              }),
            document.querySelector('#nombreRol').value="",
            document.querySelector('#estadoRol').value="" )//Si la búsqueda es exitosa
           }else{
            reject(
                Swal.fire({
                     icon: 'success',
                     title: 'Rol registrado correctamente'
                }).then(function() {
                    window.location.href = "roles";
                  }),
                document.querySelector('#nombreRol').value="",
                document.querySelector('#estadoRol').value=""
            ) //Si la búsqueda no fue exitosa
           }
        })
    }if (campos.nombreRol==false) {
		Swal.fire({
            icon: 'error',
            title: 'El nombre es inválido'
          })
	}
}

const validar = document.querySelector('#boton')
validar.addEventListener('click',getRol)

