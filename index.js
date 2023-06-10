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

    const result = await collection.find({ status: "approved" }).toArray();

    res.send(result);
})

const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;

    const queryEmail = req.query.email;

    if (!authorization) {
        return res.status(401).send({ message: 'not authorized' })
    }

    const payload = authorization.split(' ')[1];

    const token = payload;

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.decoded = decoded.payload;
        next();
    }
    catch (err) {
        return res.status(403).send({ message: 'not authorized' });
    }

}

app.get('/token', async (req, res) => {
    const payload = req.query.email;

    const token = jwt.sign({ payload }, process.env.SECRET, { expiresIn: "10h" });

    res.send({ token });
})

app.post('/user', async (req, res) => {
    const user = req.body;

    const collection = await client.db('harlem-heartstrings').collection('all-users');

    const userResult = await collection.findOne({ email: user.email });

    if (!userResult) {
        await collection.insertOne(user);
    }
    res.send({ "message": "recieved" })
})

app.get('/role', verifyJwt, async (req, res) => {
    if (req.decoded !== req.query.email) {
        return res.status(403).send({ message: 'not authorized' });
    }
    const collection = await client.db('harlem-heartstrings').collection('all-users');

    const result = await collection.findOne({ email: req.query.email }, { projection: { _id: 0, role: 1 } })

    res.send(result);
})

app.get('/allclasses', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "admin")
        return res.status(403).send({ message: 'not authorized' });

    const collection = await client.db('harlem-heartstrings').collection('classes');

    const result = await collection.find({}).toArray();

    res.send(result);
})

app.get('/allusers', verifyJwt, async (req, res) => {
    const collection = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "admin")
        return res.status(403).send({ message: 'not authorized' });

    const result = await collection.find({}).toArray();

    res.send(result);
})

app.get('/instructor-classes', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "instructor")
        return res.status(403).send({ message: 'not authorized' });

    const collection = await client.db('harlem-heartstrings').collection('classes');

    const result = await collection.find({ instructor_email: req.decoded }).toArray();

    res.send(result);
})

app.post('/add-class', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "instructor")
        return res.status(403).send({ message: 'not authorized' });

    const collection = await client.db('harlem-heartstrings').collection('classes');
    const newClass = req.body;

    const result = await collection.insertOne(newClass);

    res.send(result);
})

app.patch('/update-task-status/:id', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "admin")
        return res.status(403).send({ message: 'not authorized' });

    const collection = await client.db('harlem-heartstrings').collection('classes');
    const query = { _id: new ObjectId(req.params.id) };
    const updateDoc = { $set: req.body };

    const result = await collection.updateOne(query, updateDoc);

    res.send(result);
})

app.patch('/update-feedback/:id', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "admin")
        return res.status(403).send({ message: 'not authorized' });

    const collection = await client.db('harlem-heartstrings').collection('classes');
    const query = { _id: new ObjectId(req.params.id) };
    const updateDoc = { $set: req.body };

    const result = await collection.updateOne(query, updateDoc);

    res.send(result);
})

app.patch('/update-user-role/:id', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1 } });

    if (userRole.role !== "admin")
        return res.status(403).send({ message: 'not authorized' });

    const query = { _id: new ObjectId(req.params.id) };
    const updateDoc = { $set: req.body };

    const result = await collection1.updateOne(query, updateDoc);

    res.send(result);
})

app.patch('/update-selected-class', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const user = await collection1.findOne({ email: req.decoded });

    if (user.role !== "student")
        return res.status(403).send({ message: 'not authorized' });

    const selected_classId = new ObjectId(req.body.selected_class);

    const classExists = await collection1.findOne({ email: req.decoded, selected_class: { $in: [selected_classId] } });
    if (classExists) return res.send({ "modifiedCount": "exists" });
    let updateDoc;
    if (user?.selected_class)
        updateDoc = { $push: { selected_class: selected_classId } };
    else updateDoc = { $set: { selected_class: [selected_classId] } };


    const result = await collection1.updateOne({ email: req.decoded }, updateDoc);

    res.send(result);
})

app.get('/my-classes', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const user = await collection1.findOne({ email: req.decoded }, { projection: { _id: 0, role: 1, selected_class: 1 } });

    if (user.role !== "student")
        return res.status(403).send({ message: 'not authorized' });

    if (!user?.selected_class || user.selected_class.length == 0)
        return res.send(JSON.stringify([]));

    const collection = await client.db('harlem-heartstrings').collection('classes');

    const result = await collection.find({ _id: { $in: user.selected_class } }).toArray();

    res.send(result);
})

app.patch('/remove-class/:id', verifyJwt, async (req, res) => {
    const collection1 = await client.db('harlem-heartstrings').collection('all-users');

    const userRole = await collection1.findOne({ email: req.decoded }, { projection: { _id: 1, role: 1 } });

    if (userRole.role !== "student")
        return res.status(403).send({ message: 'not authorized' });

    const userQuery = { _id: new ObjectId(userRole._id) };
    const userUpdate = { $pull: { selected_class: new ObjectId(req.params.id) } };
    const result = await collection1.updateOne(userQuery, userUpdate);

    res.send(result);
})

app.get('/popular-classes', async (req, res) => {
    const collection = await client.db('harlem-heartstrings').collection('classes');

    const result = await collection.find({ status: "approved" }, { projection: { _id: 1, image: 1, enrolled: 1 } }).limit(6).sort({ enrolled: -1 }).toArray();
    console.log(result);
    res.send(result);
});

app.get('/popular-instructors', async (req, res) => {
    const collection = await client.db('harlem-heartstrings').collection('all-users');

    const pipeline = [
        {
            $match: { role: 'instructor' }
        },
        {
            $lookup: {
                from: 'classes',
                localField: 'email',
                foreignField: 'instructor_email',
                as: 'enrolled_classes'
            }
        },
        {
            $addFields: {
              enrolled_classes: {
                $filter: {
                  input: '$enrolled_classes',
                  as: 'class',
                  cond: { $eq: ['$$class.status', 'approved'] }
                }
              }
            }
          },
        {
            $project: {
                _id: 1,
                name: 1,
                totalEnrolled: { $sum: '$enrolled_classes.enrolled' }
            }
        },
        {
            $sort: { totalEnrolled: -1 }
        }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.send(result);
});