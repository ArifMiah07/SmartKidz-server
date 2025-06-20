import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";



// define app
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // 'https://smart-kidz-95c4e.web.app',
      // 'https://smart-kidz-95c4e.firebaseapp.com',
      // 'http://localhost:5174',
      // 'https://smart-kidz-server-liard.vercel.app',
    ],
    credentials: true,
  })
);

app.get('/', (req, res)=> {
    res.send('smart kids server is running!!');
} )




export default app;