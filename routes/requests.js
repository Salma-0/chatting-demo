const express = require('express');
const router = express.Router();
const FriendshipRequest = require('../models/Request');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId;

const auth = require('../middleware/auth');


function exists(id, arr){
    for(i of arr){
        if(i.toString() === id.toString())
          return true;
    }

    return false;
}


//send friendship request
router.post('/', auth, async (req, res)=> {
    try {
        const {to} = req.body;
        
        const request = new FriendshipRequest({
            user: to,
            from: req.user.id
        });
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/list', auth, async (req, res)=>{
    try {
        const requests = await  FriendshipRequest.find({user: req.user.id}).populate('from')
        res.json(requests);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

router.get('/',  (req, res)=> {
    res.render("requests");
})

router.get('/:id/accept', auth, async (req, res)=>{
    try {
        const request = await FriendshipRequest.findById(req.params.id);
        console.log(request)
        if(request.user.toString() !== req.user.id.toString()){
            return res.status(401).send('Authorization Denied')
        }
       
        //add new friend to sender's friends
        await User.findOneAndUpdate({_id: request.from}, {$addToSet: {friends: new ObjectId(req.user.id)}});
       
        await User.findOneAndUpdate({_id: req.user.id}, {$addToSet: {friends: new ObjectId(request.from)}});
       await FriendshipRequest.findByIdAndDelete(request._id);
       res.json(request._id)

    } catch (error) {
        res.status(500).send(error.message);
    }
})


module.exports = router;