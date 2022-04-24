const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const isAuthenticated = require('../middlewares/isAuthenticated');

const User = require('../models/User');
const Offer = require('../models/Offer');

router.post('/offer/publish', isAuthenticated, async (req, res) => {
	try {
		// console.log(req.fields);
		// console.log(req.files.picture.path);
		const { title, description, price, condition, city, brand, size, color } =
			req.fields;
		// Créer une nouvelle annonce

		const newOffer = new Offer({
			product_name: title,
			product_description: description,
			product_price: price,
			product_details: [
				{ MARQUE: brand },
				{ TAILLE: size },
				{ ETAT: condition },
				{ COULEUR: color },
				{ EMPLACEMENT: city },
			],
			owner: req.user,
		});
		// console.log(newOffer);

		// Envoie de l'image à cloudinary
		const result = await cloudinary.uploader.upload(req.files.picture.path, {
			folder: `/vinted/offers/${newOffer._id}`,
		});
		// Ajouter result à product-image
		newOffer.product_image = result;
		//Sauvegarder l'annonce
		await newOffer.save();
		console.log(result);
		res.json({
			_id: newOffer._id,
			product_name: newOffer.product_name,
			product_description: newOffer.product_description,
			product_price: newOffer.product_price,
			product_details: newOffer.product_details,
			owner: {
				account: newOffer.owner.account,
				_id: newOffer.owner._id,
			},
			product_image: newOffer.product_image,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});
router.get('/offers', async (req, res) => {
	try {
		// On envoie un objet ds un find
		// req.query.title
		//req.query.priceMin
		let filters = {};
		if (req.query.title) {
			filters.product_name = new RegExp(req.query.title, 'i');
		}
		if (req.query.priceMin) {
			filters.product_price = {
				$gte: req.query.priceMin,
			};
		}
		if (req.query.priceMax) {
			if (filters.product_price) {
				filters.product_price.$lte = req.query.priceMax;
			} else {
				filters.product_price = {
					$lte: req.query.priceMax,
				};
			}
		}
		let sort = {};
		if (req.query.sort === 'price-asc') {
			sort = { product_price: 1 };
		} else if (req.query.sort === 'price-desc') {
			sort = { product_price: -1 };
		}
		let page;
		if (Number(req.query.page) < 1) {
			page = 1;
		} else {
			page = Number(req.query.page);
		}
		let limit = Number(req.query.limit);

		const offers = await Offer.find(filters)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(limit)
			.select('product_name product_price');
		res.status(200).json(offers);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});
router.get('/offer/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const offer = await Offer.findById(id).populate({
			path: 'owner',
			select: 'account',
		});
		res.status(200).json(offer);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});
module.exports = router;
