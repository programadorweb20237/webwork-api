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
// Resto de la configuración de tu servidor....

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

    // Si 'code' es "Codigo" o está vacío, ignora esta fila y no la insertes en la base de datos
    if (code !== "Codigo" && code !== null && code.trim() !== "") {
      // Actualiza todas las filas con el mismo 'code'
      await connection.execute(
        'UPDATE quimicoNormal SET dealerPrice = ?, retailPrice = ?, costoKilo = ?, description = ?, presentation = ? WHERE code = ?',
        [dealerPrice, retailPrice, costoKilo, description, presentation, code]
      );

      if (connection.affectedRows > 0) {
        console.log(`Registros actualizados para el código ${code}`);
      } else {
        // Si no se actualiza ninguna fila, inserta una nueva
        await connection.execute(
          'INSERT INTO quimicoNormal (quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?)',
          [quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo]
        );

        console.log(`Nuevo registro insertado para el código ${code}`);
      }
    } else {
      console.log(`Fila con 'code' igual a "Codigo" o vacío ignorada`);
    }

    // Cierra la conexión a la base de datos
    await connection.end();
  } catch (error) {
    console.error('Error al insertar o actualizar datos en la base de datos:', error);
    console.log(code);
  }
}

// Lee el archivo Excel
const workbook = xlsx.readFile('./src/archivo.xlsm');

// Selecciona la hoja 'Quimicos'
const worksheet = workbook.Sheets['Quimicos'];

// Recorre las filas desde A7 hasta A100
for (let rowNum = 7; rowNum <= 100; rowNum++) {
  const quimicoId = null; // Valor fijo para quimicoId
  let code = worksheet[`A${rowNum}`] ? worksheet[`A${rowNum}`].v : null;
  const description = worksheet[`B${rowNum}`] ? worksheet[`B${rowNum}`].v : null;
  const presentation = worksheet[`C${rowNum}`] ? worksheet[`C${rowNum}`].v : null;
  const dealerPrice = worksheet[`D${rowNum}`] ? parseFloat(worksheet[`D${rowNum}`].v).toFixed(2) : null;
  const retailPrice = worksheet[`E${rowNum}`] ? parseFloat(worksheet[`E${rowNum}`].v).toFixed(2) : null;
  const costoKilo = worksheet[`F${rowNum}`] ? parseFloat(worksheet[`F${rowNum}`].v).toFixed(2) : null;

  // Si 'code' es "Codigo" o no es una cadena vacía, ignora esta fila y no la insertes en la base de datos
  if (typeof code === 'string' && code.trim() !== "" && code !== "Codigo") {
    // Inserta o actualiza los datos en la base de datos
    insertOrUpdateDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);
    console.log(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);
  } else {
    console.log(`Fila con 'code' igual a "Codigo" o vacío ignorada`);
  }
}

// Resto del código de tu aplicación....



export default app;