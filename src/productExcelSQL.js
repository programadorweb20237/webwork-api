import xlsx from 'xlsx';
import mysql2 from 'mysql2/promise';

// Configura el pool de conexiones a la base de datos MySQL
const pool = mysql2.createPool({
  host: '45.77.158.192',
  user: 'dairycom_nuevvo',
  password: 'buenosaires159951',
  port: 3306,
  database: 'dairycom_productNormal',
  waitForConnections: true, // Espera si no hay conexiones disponibles en el pool
  connectionLimit: 10, // Limita el número de conexiones concurrentes
});

// Función para insertar o actualizar datos en la base de datos
export async function insertOrUpdateDatos(productId, code, description, presentation, dealerPrice, retailPrice) {
  let connection;
  try {
    connection = await pool.getConnection();

    // Verifica y ajusta los valores
    if (code === "#N/A") {
      code = "-";
    }

    if (dealerPrice === 42 && retailPrice === 42) {
      dealerPrice = 0;
      retailPrice = 0;
    }

    // Consulta si 'code' ya existe en la base de datos
    const [rows] = await connection.execute(
      'SELECT * FROM productNormal WHERE code = ?',
      [code]
    );

    if (rows.length > 0) {
      // Si 'code' existe, actualiza la fila existente
      await connection.execute(
        'UPDATE productNormal SET dealerPrice = ?, retailPrice = ?, description = ?, presentation = ? WHERE code = ?',
        [dealerPrice, retailPrice, description, presentation, code]
      );

      console.log(`Registro actualizado para el código ${code}`);
    } else {
      // Si 'code' no existe, inserta una nueva fila
      await connection.execute(
        'INSERT INTO productNormal (productId, code, description, presentation, dealerPrice, retailPrice) ' +
        'VALUES (?, ?, ?, ?, ?, ?)',
        [productId, code, description, presentation, dealerPrice, retailPrice]
      );

      console.log(`Nuevo registro insertado para el código ${code}`);
    }
  } catch (error) {
    console.error('Error al insertar o actualizar datos en la base de datos:', error);
    console.log(code);
  } finally {
    if (connection) {
      connection.release(); // Libera la conexión de vuelta al pool
    }
  }
}

// Función para procesar el archivo Excel
export function processExcelData(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets['Base'];

    for (let rowNum = 5; rowNum <= 1311; rowNum++) {
      const productId = null;
      let code = worksheet[`A${rowNum}`] ? worksheet[`A${rowNum}`].v : null;
      const description = worksheet[`B${rowNum}`] ? worksheet[`B${rowNum}`].v : null;
      const presentation = worksheet[`C${rowNum}`] ? worksheet[`C${rowNum}`].v : null;
      let dealerPrice = worksheet[`D${rowNum}`] ? parseFloat(worksheet[`D${rowNum}`].v).toFixed(2) : null;
      let retailPrice = worksheet[`E${rowNum}`] ? parseFloat(worksheet[`E${rowNum}`].v).toFixed(2) : null;

      if (code !== null && typeof code !== 'string') {
        code = code.toString();
      }

      if (typeof code === 'string' && code.trim() !== "") {
        insertOrUpdateDatos(productId, code, description, presentation, dealerPrice, retailPrice);
        console.log(productId, code, description, presentation, dealerPrice, retailPrice);
      } else {
        console.log(`Fila con 'code' vacío ignorada`);
        console.log(`Fila ${rowNum} - Código: "${code}"`);
      }
    }
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
  }
}
