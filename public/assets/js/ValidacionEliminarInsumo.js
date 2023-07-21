const eliminarInsumo = () =>{
    Swal.fire({
        title: 'Estas seguro de eliminar el insumo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Eliminar'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Eliminado!',
            'El insumo ha sido eliminado correctamente',
            'success'
          )
        }
      })
}
const validar = document.querySelector('#Eliminar')
validar.addEventListener('click',eliminarInsumo)