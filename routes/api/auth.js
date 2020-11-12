const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator'); //removed /check because of depreciation message

//@route GET api/auth
//@desc Test route
//@access Public
router.get('/', auth, async (req, res) => {
	 try{
		const user = await User.findById(req.user.id).select('-password '); 
		res.json(user);
	 }catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	 }
});


//@route POST api/auth
//@desc Authenticate use and get token 
//@access Public
router.post('/', [
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Password is required').exists()
],
async (req, res) => {
	// console.log(req.body);
	const errors = validationResult(req);

	if(!errors.isEmpty()){
		return res.status(400).json({errors: errors.array()});
	}

	const {email, password} = req.body;

	try{
		let user = await User.findOne({ email});

		if(!user){
			return res
			.status(400)
			.json({errors: [{msg: 'Invalid credentials'}]});
		}

		//If use exists we have password stored in the user object so we compare plain text password and encrypted password
		const isMatch = await bcrypt.compare(password, user.password);

		//If not a match
		if(!isMatch){
			return res
			.status(400)
			.json({errors: [{msg: 'Invalid credentials'}]});
		}
	 
		//Return json webtoken
		const payload = {
			user: {
				id: user.id
			}
		};

		jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 3600000},
			(err, token ) => {
				if(err) throw err;
				res.json({ token });
			}
		);
	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}	
}
);

module.exports = router;