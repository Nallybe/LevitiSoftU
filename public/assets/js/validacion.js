const usuarios = [
    {
        id: 1,
        nombre: 'Nallybe',
        contrasena: '123'
    },
    {
        id: 2,
        nombre:  'Jose',
        contrasena: '123'
    },
    {
        id: 3,
        nombre: 'Alejandra',
        contrasena: '123'
    },
    {
        id: 4,
        nombre: 'Santiago',
        contrasena: '123'
    },
    {
        id: 5,
        nombre: 'Jesid',
        contrasena: '123'
    }
]

const getUsuario = () => {
    let nombreU = document.querySelector('#user').value
    let pass = document.querySelector('#pass').value
    
    return new Promise( (resolve, reject) => {
        let encontrado = false
        usuarios.forEach(usuario => {
            if(usuario.nombre==nombreU && usuario.contrasena == pass){
                encontrado = true
            }
        })
       if (encontrado == true) {
        resolve( window.location.href = "/dashboard" )//Si la búsqueda es exitosa
       }
       else{
        reject(alert('Usuario no encontrado')) //Si la búsqueda no fue exitosa
       }
        
    })
}

const validar = document.querySelector('#boton')
validar.addEventListener('click',getUsuario)

