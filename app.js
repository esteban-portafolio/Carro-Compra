document.addEventListener("DOMContentLoaded", () => {
    fetchData()
    cargarStorage()
    pintarCarrito()
    filtrar()
})

const fetchData = async () => {
    try {
        // const res = await fetch('api.json')
        // const data = await res.json()
        const response = await fetch('https://fakestoreapi.com/products')
        const data = await response.json()
        console.log(data)

        llenarProd(data)
        detectarBtn(data)
    } catch (error) {
        console.log(error)
    }
}

let contProd = document.querySelector('#contProductos')
let llenarProd = (data) => {
    filtrar()
    let tempProd = document.querySelector('#tempProductos').content
    let fragment = document.createDocumentFragment()
    //console.log(tempProd)
    data.forEach(products => {
        //console.log(products)
        tempProd.querySelector('img').setAttribute('src', products.image)
        tempProd.querySelector('h5').textContent = products.title
        tempProd.querySelector('p span').textContent = products.price
        tempProd.querySelector('button').dataset.id = products.id


        let clone = tempProd.cloneNode(true)
        fragment.appendChild(clone)
    });

    contProd.appendChild(fragment)
}

let carrito = {}

let detectarBtn = (data) => {
    let botones = document.querySelectorAll('.card button')
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            //console.log(btn.dataset.id)
            let producto = data.find(item => item.id === parseInt(btn.dataset.id))
            producto.cantidad = 1
            if (carrito.hasOwnProperty(producto.id)) {
                producto.cantidad = carrito[producto.id].cantidad + 1
            }
            carrito[producto.id] = { ...producto }
            pintarCarrito()
        })
    })
}

let filtrar = () => {
    let input = document.querySelector('#buscaInput')
    input.addEventListener('keyup', e => {
        let texto = input.value.toLowerCase()
        //console.log(texto)
        for (let d of data) {
            let titulo = d.title.toLowerCase()
            if (titulo.indexOf(texto) !== -1) {
                llenarProd(data)
            }
        }
        //llenarProd(newFilter)
    })
}

///PRODUCTOS///
let items = document.getElementById('items')
let pintarCarrito = () => {

    guardarStorage()
    items.innerHTML = ''

    let template = document.querySelector('#tempCarrito').content
    let fragment = document.createDocumentFragment()

    Object.values(carrito).forEach(producto => {
        //console.log(producto)
        template.querySelector('img').src = producto.image
        template.querySelectorAll('td')[0].textContent = producto.description
        template.querySelectorAll('td')[1].textContent = producto.cantidad
        template.querySelector('span').textContent = producto.price * producto.cantidad

        //botones
        template.querySelector('.btn-info').dataset.id = producto.id
        template.querySelector('.btn-danger').dataset.id = producto.id

        let clone = template.cloneNode(true)
        fragment.appendChild(clone)
    })

    items.appendChild(fragment)

    pintarFooter()
    btnAction()
}

/////FOOTER/////
let footer = document.getElementById('footer-carrito')
let contadorCarrito = document.getElementById('contadorCarrito')

let pintarFooter = () => {

    guardarStorage()
    footer.innerHTML = ''

    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
            <th scope="row" colspan="5">Carrito Vacio</th>
        `
        contadorCarrito.innerText = '0'
        return
    }

    let template = document.querySelector('#tempFooter').content
    let fragment = document.createDocumentFragment()

    //sumar cantidad y totales
    let nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    //console.log(nCantidad)
    let nTotal = Object.values(carrito).reduce((acc, { cantidad, price }) =>
        acc + cantidad * price, 0)
    //console.log(nTotal)

    template.querySelectorAll('td')[0].textContent = nCantidad
    template.querySelector('span').textContent = nTotal

    let clone = template.cloneNode(true)

    fragment.appendChild(clone)

    footer.appendChild(fragment)

    //Contador en el icono del carrito
    contadorCarrito.innerText = nCantidad

    // Boton vaciar carrito
    let boton = document.querySelector('#btnVaciar')
    boton.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
        contadorCarrito.innerText = '0'
    })


    let modal = document.querySelector('#btnComprar')
    modal.addEventListener('click', () => {
        Swal.fire({
            icon: 'question',
            title: 'Esta seguro de su compra?',
            html:
                '<b> Cantidad de Items: ' + nCantidad + '</b><br>' +
                '<b>Total de tu compra: $' + nTotal + ' US</b>',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Comprarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Realizado',
                    'Tu compra fue realizada con exito.',
                    'success'
                )
                carrito = {}
                pintarCarrito()
                contadorCarrito.innerText = '0'
            }
        })
    })


}

let btnAction = () => {
    let btnAgregar = document.querySelectorAll('#items .btn-info')
    let btnEliminar = document.querySelectorAll('#items .btn-danger')


    btnAgregar.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = carrito[btn.dataset.id]
            producto.cantidad++
            carrito[btn.dataset.id] = { ...producto }
            pintarCarrito()

        })
    })

    btnEliminar.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = carrito[btn.dataset.id]
            producto.cantidad--
            if (producto.cantidad === 0) {
                delete carrito[btn.dataset.id]
            } else {
                carrito[btn.dataset.id] = { ...producto }
            }

            pintarCarrito()


        })
    })

}



function guardarStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito))
}


function cargarStorage() {
    if (localStorage.getItem('carrito') !== null) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
    }
}