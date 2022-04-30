require('dotenv').config();
const express = require('express');
const cors = require('cors');

const formidable = require('express-formidable');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);
cloudinary.config({
	cloud_name: 'doysyenot',
	api_key: '536348866497363',
	api_secret: 'bQ6jp7e0pLsICeJQci8p1VxxSxM',
});

// Import de mes routes
const userRoutes = require('./routes/user');
app.use(userRoutes);

const offerRoutes = require('./routes/offer');
app.use(offerRoutes);

app.get('/', (req, res) => {
	res.json('Hello Heroku');
});

app.all('*', (req, res) => {
	res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT || 3000, () => {
	console.log('Server Started');
});
