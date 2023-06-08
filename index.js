const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('listening on port ', PORT);
})

app.get('/', (req, res) => {
    res.send('Harlem Heartstrings api server running....');
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@crud-practice.heeny6h.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/instructors', async (req, res) => {
    const collection = await client.db('harlem-heartstrings').collection('all-users');

    const result = await collection.find({ role: "instructor" }).toArray();

    res.send(result);
})

app.get('/classes', async (req, res) => {
    const collection = await client.db('harlem-heartstrings').collection('classes');

    const result = await collection.find({}).toArray();

    res.send(result);
})

const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).send({ message: 'not authorized' })
    }

    const payload = authorization.split(' ')[1];

    const token = payload;

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        next();
    }
    catch (err) {
        return res.status(403).send({ message: 'not authorized' });
    }

}

app.get('/token', async(req, res) => {
    const payload = req.query.email;
     
    const token = jwt.sign({ payload }, process.env.SECRET, { expiresIn: "10h" });

    res.send({ token });
})