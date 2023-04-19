const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express()

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7eooxat.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient (uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJwt (req, res, next){
//     console.log('this is token', req.headers.authorization);
//     const authHeader = req.headers.authorization;
//     if(!authHeader){
//         return res.status(403).send('unathorized')
//     };
//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
//         if(err){
//             return res.status(403).send({message: 'unautorized aceess'})
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

function run() {
    try {
        const usersCollections = client.db('jarinsParlour').collection('users');
        const teamMemberCollection = client.db('jarinsParlour').collection('teamMember');

        app.get('/', async (req, res) => {
            res.send('parler server is running')
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);
        });


        // admin check 
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollections.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });
        
        app.get('/teamMember',  async (req, res) =>{
            const query = {};
            const result = await teamMemberCollection.find(query).toArray();
            res.send(result);
        });

        // add a teamMember 
        app.post('/teamMember', async (req, res) =>{
            const teamMember = req.body;
            const result = await teamMemberCollection.insertOne(teamMember);
            res.send(result);
        });


        app.delete('/teamMember/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await teamMemberCollection.deleteOne(filter);
            res.send(result)
        });

        app.get('/jwt', async (req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollections.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN)
                return res.send({accessToken: token})
            }
            console.log(user);
            res.status(403).send({accessToken: ''})
        })
    }
    catch {

    }
}

run();

app.listen(port, () => console.log(`parler server is running on port ${port}`))

