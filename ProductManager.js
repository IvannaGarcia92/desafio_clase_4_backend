const fs = require('fs').promises;

// definimos la clase ProductManager
class ProductManager {
    constructor (jsonFilePath) { // el constructor recibe la ruta al archivo json como parámetro
        this.path = jsonFilePath;
    }

    // reset
    async resetProductsFile() {
        try {
            await fs.writeFile(this.path, '[]'); // escribimos un arreglo vacío en el archivo JSON para reiniciar los productos
            console.log("Archivo de productos reiniciado.");
        } catch (error) {
            console.error('Error resetting products file:', error);
            throw error;
        }
    }

    // agregamos un nuevo producto al archivo
    async addProduct (productData) {
        try {
            let products = await this.getProductsFromFile(); // obtenemos los productos del archivo
            productData.id = products.length > 0 ? products[ products.length - 1 ].id + 1 : 1; // le asignamos un ID autoincrementable a cada producto
            products.push(productData); // agregamos el nuevo producto al array
            await this.saveProductsToFile(products); // guardamos el array actualizado en el archivo
            return productData.id; // retornamos el ID del producto agregado
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // obtenemos todos los productos del archivo
    async getProducts () {
        try {
            return await this.getProductsFromFile(); // obtenemos y retornamos los productos del archivo
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // obtenemos un producto por su ID
    async getProductById (id) {
        try {
            const products = await this.getProductsFromFile(); // obtenemos los productos del archivo
            const product = products.find(item => item.id === id); // buscamos el producto por su ID
            if (!product) {
                throw new Error('Product not found'); // lanzamos un error si no encuentra el producto
            }
            return product; // retornamos el producto en caso de encontrarlo
        } catch (error) {
            console.error('Error fetching product by id:', error);
        }
    }

    // actualizamos un producto por su ID
    async updateProducts (id, updatedFields) {
        try {
            let products = await this.getProductsFromFile();  // obtenemos los productos actuales del archivo
            const index = products.findIndex(item => item.id === id); // buscamos el índice del producto a actualizar por su ID
            if (index === -1) {
                throw new Error('Product not found'); // lanzamos un error si el producto no existe
            }
            products[index] = {...products[index], ...updatedFields}; // actualizamos los campos mediante la desestructuración de objetos
            await this.saveProductsToFile(products); // guardamos los productos actualizados en el archivo
        } catch (error) {
            console.error('Error updating product:', error);
        }
    }

    async deleteProduct (id) {
        try {
            let products = await this.getProductsFromFile(); // obtenemos los productos actuales del archivo 
            products = products.filter(item => item.id !== id); // filtramos los productos para eliminar el que coincida con el ID especificado (lo excluímos en un nuevo array)
            await this.saveProductsToFile(products); // guardamos los productos actualizados en el archivo, ya sin el producto que fue excluído (eliminado)
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }

    // método para obtener los productos desde el archivo json
    async getProductsFromFile() {
        try {
            const data = await fs.readFile(this.path, 'utf-8'); // leemos el archivo JSON y lo convertimos en un objeto js
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading file:', error);
            return []; //retornamos on objeto vacío en caso de error
        }
    }

    // método para guardar los productos desde el archivo json
    async saveProductsToFile(products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(products, null, 2)); // convertimos el objeto js en formato JSON y lo escribimos en el archivo
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }
    
    // método para ejecutar las pruebas
    async runTests() {
        console.log("Proceso de testing:");

        try {
            // Paso 1: llamamos a getProducts y debe devolver un arreglo vacío
            console.log("\nPaso 1: Llamamos a getProducts y debe devolver un arreglo vacío:");
            console.log(await this.getProducts());

            // Paso 2: agregamos un producto
            console.log("\nPaso 2: Agregamos un producto:");
            const productId = await this.addProduct({
                title: "producto de prueba",
                description: "Este es un producto de prueba",
                price: 200,
                thumbnail: "Sin imagen",
                code: "abc123",
                stock: 25
            });
            console.log("ID del producto agregado:", productId);

            // agregamos otro producto el cual NO eliminaremos para comprobar funcionalidad del addProduct
            console.log("\nPaso 3: Agregamos otro producto:");
            const productId2 = await this.addProduct({
                title: "producto de prueba 2",
                description: "Este es un producto de prueba 2",
                price: 300,
                thumbnail: "Sin imagen",
                code: "def456",
                stock: 20
                }
            );
            console.log("ID del segundo producto agregado:", productId2);

            // Paso 3: llamamos a getProducts nuevamente y debe aparecer el producto recién agregado
            console.log("\nPaso 3: Llamamos a getProducts nuevamente y debe aparecer el producto recién agregado:");
            console.log(await this.getProducts());

            // Paso 4: llamamos a getProductById para obtener el producto por su ID
            console.log("\nPaso 4: Llamamos a getProductById para obtener el producto por su ID:");
            const productById = await this.getProductById(productId);
            console.log("Producto encontrado por ID:", productById);

            // Paso 5: intentamos actualizar un campo del producto
            console.log("\nPaso 5: Intentamos actualizar un campo del producto:");
            await this.updateProducts(productId, { title: "UPDATED PRODUCT" }); // Cambiamos el precio del producto
            console.log("Producto actualizado correctamente.");
            console.log(await this.getProducts());

            // Paso 6: intentamos eliminar el producto
            console.log("\nPaso 6: Intentamos eliminar el producto:");
            await this.deleteProduct(productId);
            console.log("Producto eliminado correctamente.");

            // Paso 7: verificamos que el producto se haya eliminado llamando a getProducts nuevamente
            console.log("\nPaso 7: Verificamos que el producto se haya eliminado llamando a getProducts nuevamente:");
            console.log(await this.getProducts());
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// funcion asíncrona autoinvocada
(async () => { //definimos una función flecha asíncrona 
    const productManager = new ProductManager('./products.json'); // se crea una instancia de 'ProductManager' con un archivo JSON de productos como argumento 
    await productManager.resetProductsFile(); // reiniciamos el archivo antes de ejecutar las pruebas
    await productManager.runTests(); // ejecutamos las pruebas (testing)
})(); // la función asíncrona se invoca inmediatamente utilizando () al final del bloque de código, esto asegura que el código dentro de la función sea ejecutado tan pronto como el script se ejecute

