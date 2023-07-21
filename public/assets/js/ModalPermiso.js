const ModalPermiso = () =>{
    Swal.fire({
        title: 'Permisos editados',
        icon: 'success'
    }).then(function() {
        window.location.href = "EditarRol";
      })
}
const modal = document.querySelector('#modalPermiso')
modal.addEventListener('click',ModalPermiso)