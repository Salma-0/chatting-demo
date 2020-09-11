const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const {getConnectedUsers} = require('../app');


//send login . register page
router.get('/login', (req, res)=> {
    res.render('login')
});

router.get('/home', (req, res)=> res.render('index'));


//register new user
router.post('/register', async(req, res)=> {
    try {
        const {nickname, email, password} = req.body;
        const exists = await User.findOne({email: email});
        
        if(exists){
            console.log(exists);
            return res.status(401).send('This email is already registered');
        }

        const salt = await bcrypt.genSalt();
        const encrypedPass = await bcrypt.hash(password, salt);

        const user = new User({nickname, email, password: encrypedPass});
        await user.save();

        const payload = {user: {id: user.id}};

        jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 60 * 60 * 3 }, (err, token)=> {
            if(err) throw err;
            else
               res.json(token);
        });

    } catch (error) {
        res.status(502).send(error.message);
    }
});


//login
router.post('/login', async (req, res)=> {
    try {
        const {email, password} = req.body;
       const user = await User.findOne({email});
       if(!user){
           return res.status(404).send("This email is not recorded!")
       } 


       const isMatch = await bcrypt.compare(password, user.password);
       
       if(!isMatch){
           return res.status(401).send('Incorrect Password');
       }
       
       const payload = {
           user: {
               id: user._id
           }
       };

       jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 60 * 60 * 3}, (err, token)=>{
           if(err) throw err;
           else res.json(token);
       });

    } catch (error) {
        res.status(500).send(error.message);
    }
})



//get the authenticated user
router.get('/', auth, async (req, res)=> {
    try {
        const user = await User.findById(req.user.id).select('-password').populate({
            path: 'friends',
            select: 'nickname email'
        });
        const online = [];
        const connected = getConnectedUsers();
        user.friends.forEach((f) =>{
            if(connected.has(f.email)){
                online.push(f._id);
            }
        })
        res.json({user, online});
    } catch (error) {
        console.error(error.stack)
        res.status(500).send(error.message);
    }
})








//get users list (non friends)
router.get('/list', auth,async (req, res)=> {
    try {
        const current = await User.findById(req.user.id);
        const friends = current.friends;
        friends.push(current._id)

        const users = await User.find({_id: {$nin: friends}}).select('-password');

        res.json(users);
    } catch (error) {
        console.log(error.stack)
        res.status(500).send(error.message);
    }
})


module.exports = router;