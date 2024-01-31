import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nxhpsct.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

let db;

async function connectDB() {
    try {
        const client = new MongoClient(url, { useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(process.env.DB_NAME);
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Initialize collections
let categoryCollection;
let subCategoryCollection;
let duaCollection;

app.use(async (req, res, next) => {
    try {
        if (!db) {
            await connectDB();
        }
        categoryCollection = db.collection('category');
        subCategoryCollection = db.collection('sub_category');
        duaCollection = db.collection('dua');
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to the database' });
    }
});

// Routes
app.get('/', (req, res) => {
    try {
        res.json(`Dua & Ruqyah Server Running on PORT ${port}`);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Category API
app.get('/api/category', async (req, res) => {
    try {
        const category = await categoryCollection.find().toArray();
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sub-Category API
app.get('/api/sub_category', async (req, res) => {
    try {
        const subCategory = await subCategoryCollection.find().toArray();
        res.json(subCategory);
    } catch (error) {
        console.error('Error fetching sub-category:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Dua API
app.get('/api/dua', async (req, res) => {
    try {
        const dua = await duaCollection.find().toArray();
        res.json(dua);
    } catch (error) {
        console.error('Error fetching dua:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
