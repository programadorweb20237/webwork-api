import express from "express";
import morgan from "morgan";
import cors from "cors";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import productsRoutes from "./routes/products.routes.js";


const app = express();


// Configurar CORS para permitir solicitudes desde el dominio de tu frontend
const corsOptions = {
  origin: 'http://localhost:3000',
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

export default app;
