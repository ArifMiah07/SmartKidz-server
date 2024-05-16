const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
    cors({
        origin: [
            'https://cars-doctor-a5cb1.web.app', 
            'https://cars-doctor-a5cb1.firebaseapp.com',
            'http://localhost:5173', 'http://localhost:5174'
        ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fovwt3b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//our own middlewares
const logger = async (req, res, next) => {
    console.log('called:', req.host, req.originalUrl)
    next();
}

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })//zodi token na theke
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}

const cookieOption = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
    secure: process.env.NODE_ENV === "production" ? true : false,
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('bookingsData');
        const aboutUsCollection = client.db('carDoctor').collection('aboutUs');

        // auth related api
        

        //logout

        
        //about us api aboutUs

        app.get('/about-us', async(req, res)=>{
            const cursor = aboutUsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // services related api
        
        //service by id
        


        // bookings with jwt
        
        //booking api
    
        //update booking
        
        //dlt booking
        


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})