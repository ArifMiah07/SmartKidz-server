const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
/**
 * //Must remove "/" from your production URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cardoctor-bd.web.app",
      "https://cardoctor-bd.firebaseapp.com",
    ],
    credentials: true,
  })
);
 */
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
        const aboutClassesCollection = client.db('carDoctor').collection('aboutClasses');
        const aboutCoursesCollection = client.db('carDoctor').collection('aboutCourses');
        const categoryCollection = client.db('carDoctor').collection('category');
        const eventsCollection = client.db('carDoctor').collection('events');
        const addedServiceCollection = client.db('carDoctor').collection('addService');

        // auth related api
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log(user);

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            });

            res.cookie('token', token, cookieOption).send({ success: true })
        })

        //logout
        app.post('/logout', async(req, res)=>{
            const user = req.body;
            console.log('logging out user: ', user)
            res.clearCookie('token', {...cookieOption , maxAge: 0}).send({success: true})
        })
        //about us api aboutUs

        app.get('/about-us', async(req, res)=>{
            const cursor = aboutUsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        
        //classes
        app.get('/about-classes', async (req, res)=>{
            const cursor = aboutClassesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        //Courses api
        app.get('/about-courses', async (req, res)=>{
            const cursor = aboutCoursesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        
        //category api
        app.get('/category', async (req, res)=>{
            const cursor = categoryCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        //events api
        app.get('/events', async (req, res)=>{
            const cursor = eventsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        

        

        // services related api
        app.get('/services', logger, async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })


        // bookings 
        app.get('/bookings', logger, verifyToken, async (req, res) => {
            console.log(req.query.email);
            console.log('ttttt token', req.cookies.token)
            console.log('user in the valid token', req.user)
            if(req.query.email !== req.user.email){
                return res.status(403).send({message: 'forbidden access'})
            }

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })
        //add service api
        app.post('/add-service', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await addedServiceCollection.insertOne(booking);
            res.send(result);
        });
        app.post('/bookings', async (req, res) => {
            try {
              const booking = new Booking(req.body);
              await booking.save();
              res.status(201).send(booking);
            } catch (error) {
              res.status(400).send(error);
            }
          });

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(updatedBooking);
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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