// server.js

import mongoose from 'mongoose';
import app from './app';


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fovwt3b.mongodb.net/carDoctor?retryWrites=true&w=majority&appName=Cluster0`;

app.listen(port, ()=>{
    console.log('Smart Kidz server is running on port' + "" + port);
})


export const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongoose connected');
  } catch (err) {
    console.error('Mongoose connection error:', err);
  }
};
