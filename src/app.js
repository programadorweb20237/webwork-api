import express from "express";
import morgan from "morgan";
import cors from "cors";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import productsRoutes from "./routes/products.routes.js";



import fs from 'fs';
import xlsx from 'xlsx';
import mysql2 from 'mysql2/promise';



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




// Resto de la configuración de tu servidor...

// Configura la conexión a la base de datos MySQL
const dbConfig = {
  host: 'containers-us-west-127.railway.app',
  user: 'root',
  password: 'V7ewl7LE6sceR1wlMgLL',
  port: 5563,
  database: 'railway',
};

// Función para insertar o actualizar datos en la base de datos
async function insertOrUpdateDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo) {
  try {
    const connection = await mysql2.createConnection(dbConfig);

    // Verifica si el registro con el mismo 'code' ya existe en la base de datos
    const [existingRow] = await connection.query(
      'SELECT * FROM quimicoNormal WHERE code = ? LIMIT 1',
      [code]
    );

    if (existingRow.length > 0) {
      // Si el registro existe, actualiza los campos que deseas mantener y mantiene 'description' y 'presentation' sin cambios
      await connection.execute(
        'UPDATE quimicoNormal SET dealerPrice = ?, retailPrice = ?, costoKilo = ? WHERE code = ?',
        [dealerPrice, retailPrice, costoKilo, code]
      );

      console.log(`Registro actualizado para el código ${code}`);
    } else {
      // Si el registro no existe, realiza una inserción
      await connection.execute(
        'INSERT INTO quimicoNormal (quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?)',
        [quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo]
      );

      console.log(`Nuevo registro insertado para el código ${code}`);
    }

    // Cierra la conexión a la base de datos
    await connection.end();
  } catch (error) {
    console.error('Error al insertar o actualizar datos en la base de datos:', error);
  }
}

// Lee el archivo Excel
const workbook = xlsx.readFile('./src/archivo.xlsm');

// Selecciona la hoja 'Quimicos'
const worksheet = workbook.Sheets['Quimicos'];

// Lee los valores de las celdas A7 a F7
const quimicoId = null; // Valor fijo para quimicoId
const code = worksheet['A7'] ? worksheet['A7'].v : null;
const description = worksheet['B7'] ? worksheet['B7'].v : null;
const presentation = worksheet['C7'] ? worksheet['C7'].v : null;
const dealerPrice = worksheet['D7'] ? parseFloat(worksheet['D7'].v).toFixed(2) : null;
const retailPrice = worksheet['E7'] ? parseFloat(worksheet['E7'].v).toFixed(2) : null;
const costoKilo = worksheet['F7'] ? parseFloat(worksheet['F7'].v).toFixed(2) : null;

// Inserta o actualiza los datos en la base de datos
insertOrUpdateDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);
console.log(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);

// Resto del código de tu aplicación...



export default app;