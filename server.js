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

// Get All Duas
app.get('/duas', async (req, res) => {
    try {
        const dua = await duaCollection.find().toArray();
        res.json(dua);
    } catch (error) {
        console.error('Error fetching dua:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get 
app.get('/duas/categories', async (req, res) => {
    try {
        const categories = await categoryCollection.find().toArray();

        const categoriesWithData = [];

        for (const category of categories) {
            const { cat_id } = category;

            const subCategories = await subCategoryCollection.find({ cat_id }).toArray();

            const subCategoriesWithDuas = [];

            for (const subCategory of subCategories) {
                const { subcat_id } = subCategory;

                const duas = await duaCollection.find({ subcat_id }).toArray();

                subCategoriesWithDuas.push({ ...subCategory, duas });
            }

            categoriesWithData.push({ ...category, subCategories: subCategoriesWithDuas });
        }

        res.json(categoriesWithData);
    } catch (error) {
        console.error('Error fetching categories with data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Duas Based On Query
app.get('/duas/:cat_name_en', async (req, res) => {
    try {
        const catNameEn = req.params.cat_name_en;
        let catId, subcatId, duaId;

        if (req.query.cat) {
            catId = parseInt(req.query.cat);
        }

        if (req.query.subcat) {
            subcatId = parseInt(req.query.subcat);
        }

        if (req.query.dua) {
            duaId = parseInt(req.query.dua);
        }

        const category = await categoryCollection.findOne({ cat_name_en: catNameEn });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        let query = { cat_id: category.cat_id };

        if (subcatId) {
            query.subcat_id = subcatId;
        }

        if (duaId) {
            query.dua_id = duaId;
        }

        const duas = await duaCollection.find(query).toArray();

        res.json({ category, duas });
    } catch (error) {
        console.error('Error fetching duas:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
