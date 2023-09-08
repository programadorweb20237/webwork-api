// quimicoExcelSQl.js
import xlsx from 'xlsx';
import mysql2 from 'mysql2/promise';

// Configura la conexión a la base de datos MySQL
const dbConfig = {
  host: 'containers-us-west-127.railway.app',
  user: 'root',
  password: 'V7ewl7LE6sceR1wlMgLL',
  port: 5563,
  database: 'railway',
  connectTimeout: 60000, // Aumenta el tiempo de espera a 60 segundos (o más si es necesario)
};

// Función para insertar o actualizar datos en la base de datos
export async function insertOrUpdateDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo) {
  try {
    const connection = await mysql2.createConnection(dbConfig);

    // Consulta si 'code' ya existe en la base de datos
    const [rows] = await connection.execute(
      'SELECT * FROM quimicoNormal WHERE code = ?',
      [code]
    );

    if (rows.length > 0) {
      // Si 'code' existe, actualiza la fila existente
      await connection.execute(
        'UPDATE quimicoNormal SET dealerPrice = ?, retailPrice = ?, costoKilo = ?, description = ?, presentation = ? WHERE code = ?',
        [dealerPrice, retailPrice, costoKilo, description, presentation, code]
      );

      console.log(`Registro actualizado para el código ${code}`);
    } else {
      // Si 'code' no existe, inserta una nueva fila
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
    console.log(code);
  }
}

// Función para procesar el archivo Excel
export function processExcelData(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets['Quimicos'];

    for (let rowNum = 7; rowNum <= 100; rowNum++) {
      const quimicoId = null;
      let code = worksheet[`A${rowNum}`] ? worksheet[`A${rowNum}`].v : null;
      const description = worksheet[`B${rowNum}`] ? worksheet[`B${rowNum}`].v : null;
      const presentation = worksheet[`C${rowNum}`] ? worksheet[`C${rowNum}`].v : null;
      const dealerPrice = worksheet[`D${rowNum}`] ? parseFloat(worksheet[`D${rowNum}`].v).toFixed(2) : null;
      const retailPrice = worksheet[`E${rowNum}`] ? parseFloat(worksheet[`E${rowNum}`].v).toFixed(2) : null;
      const costoKilo = worksheet[`F${rowNum}`] ? parseFloat(worksheet[`F${rowNum}`].v).toFixed(2) : null;

      if (code !== null && typeof code !== 'string') {
        code = code.toString();
      }

      if (typeof code === 'string' && code.trim() !== "" && code !== "Codigo") {
        insertOrUpdateDatos(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);
        console.log(quimicoId, code, description, presentation, dealerPrice, retailPrice, costoKilo);
      } else {
        console.log(`Fila con 'code' igual a "Codigo" o vacío ignorada`);
        console.log(`Fila ${rowNum} - Código: "${code}"`);
      }
    }
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
  }
}