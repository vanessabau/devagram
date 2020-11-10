const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator'); //removed /check because of depreciation message

const User = require('../../models/User');

//@route POST api/users
//@desc Register user
//@access Public
router.post('/', [
	check('name', 'Name is required').not().isEmpty(),
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
],
async (req, res) => {
	// console.log(req.body);
	const errors = validationResult(req);

	if(!errors.isEmpty()){
		return res.status(400).json({errors: errors.array()});
	}

	const {name, email, password} = req.body;

	try{
		let user = await User.findOne({ email});

		if(user){
			return res.status(400).json({errors: [{msg: 'User already exists'}]});
		}

		//Set up the avatarfrom the email
		const avatar = gravatar.url(email, {
			s: '200',
			r: 'pg',
			d: 'mm'
		});

		//create an instance of a user
		user = new User({
			name,
			email,
			avatar,
			password
		});

		//Create a salt to do the hashing. Pass in the rounds
		const salt = await bcrypt.genSalt(10);

		//Creates a hash and puts it into the user password
		user.password = await bcrypt.hash(password, salt);

		//save the user to the database
		await user.save();
	 
		//Return json webtoken

		res.send('User registered');
	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}

	
});

module.exports = router;