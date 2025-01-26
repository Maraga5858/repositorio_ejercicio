const { createApp } = Vue;

const App = {
  data() {
    return {
      productos: [
        { id: 1, nombre: "Mancuernas", precio: 20, imagen: "img/mancuernas.webp", cantidadDeseada: 1 },
        { id: 2, nombre: "Cinta de correr", precio: 300, imagen: "img/cinta_correr.webp", cantidadDeseada: 1 },
        { id: 3, nombre: "Bicicleta estática", precio: 150, imagen: "img/bici.webp", cantidadDeseada: 1 },
        { id: 4, nombre: "Pesas rusas", precio: 25, imagen: "img/pesas_rusas.webp", cantidadDeseada: 1 },
        { id: 5, nombre: "Esterilla", precio: 10, imagen: "img/esterilla.webp", cantidadDeseada: 1 },
        { id: 6, nombre: "Banco de pesas", precio: 100, imagen: "img/banco_pesas.webp", cantidadDeseada: 1 },
      ],
      carrito: [],
      tasaCambio: 1,
      divisaSeleccionada: "USD",
      conversionesDisponibles: {},
      totalConvertido: null,
      mostrarCarrito: false, // Controla la visibilidad del carrito
    };
  },

  methods: {

    // Metodo para cambiar de productos la cantidad y subirla
    incrementarCantidadProducto(productoId) {
      const producto = this.productos.find((prod) => prod.id === productoId);
      if (producto.cantidadDeseada < 9) {
        producto.cantidadDeseada++;
      }
    },

    // Metodo para cambiar de productos la cantidad y bajarla
    reducirCantidadProducto(productoId) {
      const producto = this.productos.find((prod) => prod.id === productoId);
      if (producto.cantidadDeseada > 1) {
        producto.cantidadDeseada--;
      }
    },

    // Incrementar la cantidad pero de la libreria de carritos no de productos
    incrementarCantidad(carritoId) {
      const carrit = this.carrito.find((item) => item.id === carritoId);
      if (carrit.cantidad < 9) {
        carrit.cantidad++;
      }
    },

    // Reducir la cantidad pero de la libreria de carritos no de productos
    reducirCantidad(carritoId) {
      const carrit = this.carrito.find((item) => item.id === carritoId);
      if (carrit.cantidad > 1) {
        carrit.cantidad--;
      }
    },

    // Pa meter cosas en el carrito
    meterCarrito(productoID) {
      const producto = this.productos.find((prod) => prod.id === productoID);
      const carrit = this.carrito.find((item) => item.id === productoID);

      if (carrit) {
        if (carrit.cantidad + producto.cantidadDeseada <= 9) {
          carrit.cantidad += producto.cantidadDeseada;
        }
      } else {
        this.carrito.push({ //añadir elementos en la libreria carrito
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidadDeseada,
        });
      }
      // Restablecer la cantidad deseada
      producto.cantidadDeseada = 1;
    },

    // eliminar del carrito
    eliminarProducto(carritoId) {
      const carrit_index = this.carrito.findIndex((item) => item.id === carritoId);
      if (carrit_index !== -1) {
        this.carrito.splice(carrit_index, 1);
      }
    },

    // API
    cargarConversiones() {
      fetch("https://v6.exchangerate-api.com/v6/2d32faab06a3c28f785d7e33/latest/EUR")
        .then((response) => response.json())
        .then((data) => {
          this.conversionesDisponibles = data.conversion_rates;
        })
        .catch((error) => {
          console.error("Error al cargar las conversiones:", error);
        });
    },


    convertirTotal() {
      if (this.conversionesDisponibles[this.divisaSeleccionada]) {
        this.tasaCambio = this.conversionesDisponibles[this.divisaSeleccionada];
        const totalEuros = this.carrito.reduce(
          (total, item) => total + item.precio * item.cantidad,
          0
        );
        this.totalConvertido = (totalEuros * this.tasaCambio).toFixed(2);
      } else {
        console.error("La divisa seleccionada no está disponible.");
      }
    },
  },

  mounted() {
    this.cargarConversiones();
  },

  template: `
    <header>
      <div class="mitad">
        <h1>Tienda de deportes</h1>
      </div>
      <div class="mitad">
        <button class="boton_abrir" @click="mostrarCarrito = true">Abrir Carrito</button>
      </div>
    </header>

    <div id="productos">
      <div class="producto" v-for="producto in productos" :key="producto.id">
        <img class="imagen_producto" :src="producto.imagen" :alt="producto.nombre" />
        <h3>{{ producto.nombre }} <b>{{ producto.precio }}€</b></h3>
        <span id="producto_abajo" class="row">
          <div id="contador" class="row">
            <button @click="reducirCantidadProducto(producto.id)">-</button>
            <p>{{ producto.cantidadDeseada }}</p>
            <button @click="incrementarCantidadProducto(producto.id)">+</button>
          </div>
          <button @click="meterCarrito(producto.id)">Añadir al carrito</button>
        </span>
      </div>
    </div>  

    <div id="carrito" v-if="mostrarCarrito">
      <div id="titulo_carrito" class="row">
        <h2>Carrito</h2>
        <button class="boton_abrir" @click="mostrarCarrito = false">Cerrar</button>
      </div>
      
      <div id="productos_carrito">
        <span class="tienda_producto" v-for="carr in carrito" :key="carr.id">
          <div class="carrito_izquierda">
            <p>{{ carr.nombre }} <b>{{ carr.precio }}€</b></p>
            <div class="row">
              <button @click="reducirCantidad(carr.id)">-</button>
              <p>{{ carr.cantidad }}</p>
              <button @click="incrementarCantidad(carr.id)">+</button>
            </div>
          </div>
          <div class="carrito_derecha">
            <button class="boton_eliminar" @click="eliminarProducto(carr.id)">Eliminar</button>
          </div>
        </span>

        <div id="factura_carrito">
          <p><b>Total: {{ carrito.reduce((total, item) => total + item.precio * item.cantidad, 0) }}€</b></p>

          <div>
            <label for="divisa">Selecciona una divisa:</label>
            <select id="divisa" v-model="divisaSeleccionada" @change="convertirTotal">
              <option v-for="(valor, divisa) in conversionesDisponibles" :key="divisa" :value="divisa">
                {{ divisa }}
              </option>
            </select>
          </div>
          <p v-if="totalConvertido"><b>Total en {{ divisaSeleccionada }}: {{ totalConvertido }}</b></p>
        </div>
      </div>
    </div>
  `,
};

createApp(App).mount("#app");
