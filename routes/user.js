const express = require('express');
const router = express.Router();
const uid2 = require('uid2');
const SHA256 = require('crypto-js/sha256');
const encBase64 = require('crypto-js/enc-base64');

const User = require('../models/User');

router.post('/user/signup', async (req, res) => {
	// const email = req.fields.email;
	const { email, username, phone, password } = req.fields;
	try {
		// Est-ce que j'ai déjà un user qui possède l'email que je reçois?
		const user = await User.findOne({ email: email });
		// Si oui, on renvoie un message et on ne procède pas à l'inscription
		if (user) {
			res.status(409).json({ message: 'Cet email existe déjà' });
		} else {
			// Sinon, on peut créer un nouveau user
			if (email && username && password) {
				// 1 - Encrypter le mdp
				// Générer un token
				const token = uid2(64);
				const salt = uid2(64);
				const hash = SHA256(password + salt).toString(encBase64);
				// 2 - Crée un new user
				const newUser = User({
					email: email,
					account: {
						username: username,
						phone: phone,
					},
					token: token,
					hash: hash,
					salt: salt,
				});
				// 3 - Sauvegarder ce user dans la BDD
				await newUser.save();
				// 4 - Répondre au client
				res.status(200).json(newUser);
			} else {
				res.status(400).json({
					message: 'Il manque des paramètres',
				});
			}
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}

	// res.json({ message: 'hello signup' });
});

router.post('/user/login', async (req, res) => {
	try {
		const { email, password } = req.fields;
		// Qui est le user qui veut se connecter ?
		const user = await User.findOne({ email: email });
		if (user) {
			console.log('Le hash du user dans la BDD est : ', user.hash);
			// Générer un nouveau hash (à partir du mot de passe reçu en body + du salt trouvé en BDD)
			const newHash = SHA256(password + user.salt).toString(encBase64);
			console.log('Le nouveau hash est :', newHash);
			// Comparer ce nouveau hash au hash de la BDD
			if (newHash === user.hash) {
				// Si ce sont les mêmes ===> OK
				res.status(200).json({
					_id: user._id,
					token: user.token,
					account: user.account,
				});
			} else {
				// Sinon ===> Unauthorized
				res.status(401).json({ message: 'Pas autorisé' });
			}
		} else {
			res.status(401).json({ message: 'Unauthorizeeed' });
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

module.exports = router;
