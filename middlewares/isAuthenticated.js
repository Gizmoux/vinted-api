const User = require('../models/User');
const isAuthenticated = async (req, res, next) => {
	//req.headers.authorization
	if (req.headers.authorization) {
		// On continue
		const token = req.headers.authorization.replace('Bearer ', '');
		console.log(token);
		// Chercher ds la BDD le user qui possède ce token
		const user = await User.findOne({ token: token });
		console.log(user);
		if (user) {
			// Ajouter une clé user à l'objet req contenant les infos du user
			req.user = user;
			return next();
		} else {
			return res.status(401).json({ message: 'isauthenticated pas autorisé' });
		}
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	// console.log(req.headers);
};
module.exports = isAuthenticated;
