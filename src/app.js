import express from "express";
import morgan from "morgan";
import cors from "cors";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import productsRoutes from "./routes/products.routes.js";



import fs from 'fs';
import xlsx from 'xlsx';
import mysql from 'mysql2/promise';



const app = express();


// Configurar CORS para permitir solicitudes desde el dominio de tu frontend
const corsOptions = {
  origin: 'https://dairysolutions.web.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Si tu aplicación utiliza credenciales (cookies, autenticación, etc.)
};

app.use(cors(corsOptions));

// Resto de la configuración de tu servidor...




// Middlewaress
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/", indexRoutes);
app.use("/api", employeesRoutes);
app.use("/api", productsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});






// Configura la conexión a la base de datos MySQL
const dbConfig = {
  host: 'containers-us-west-127.railway.app',
  user: 'root',
  password: 'V7ewl7LE6sceR1wlMgLL',
  database: 'railway',
};

// Función para insertar datos en la base de datos
async function insertarDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Realiza la inserción en la tabla 'quimicos'
    await connection.execute(
      'INSERT INTO quimicos (quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo]
    );

    console.log('Datos insertados correctamente en la base de datos');

    // Cierra la conexión a la base de datos
    await connection.end();
  } catch (error) {
    console.error('Error al insertar datos en la base de datos:', error);
  }
}

// Lee el archivo Excel
const workbook = xlsx.readFile('./src/archivo.xlsm');

// Selecciona lla hoja 'Quimicos'
const worksheet = workbook.Sheets['Quimicos'];

// Lee los valores de las celdas A7 a F7
const quimicoId = null; // Valor fijo para quimicoId
const code = worksheet['A7'] ? worksheet['A7'].v : null;
const description = worksheet['B7'] ? worksheet['B7'].v : null;
const presentation = worksheet['C7'] ? worksheet['C7'].v : null;
const dealerPrice = worksheet['D7'] ? worksheet['D7'].v : null;
const retailPrice = worksheet['E7'] ? worksheet['E7'].v : null;
const costoKilo = worksheet['F7'] ? worksheet['F7'].v : null;

// Inserta los datos en la bbase de datos
//insertarDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);
console.log (quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);












export default app;
