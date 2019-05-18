// routes/project-routes.js
const express = require('express');
const mongoose = require('mongoose');
const router  = express.Router();

const Offer = require('../models/offer');
const Order = require('../models/order');
const User = require('../models/users'); // <== !!!


// POST route => to create a new project
router.post('/orders', (req, res, next)=>{
  
  Order.create({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    unity: req.body.unity,
    minimum: req.body.minimum,
    total: req.body.total, 
    category: req.body.category,  
    owner: req.body.owner,
    buyer: req.user._id,
    courier: "",
    category: "Waiting courier confirmation"
  })
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.json(err);
    })
});


router.get('/orders', (req, res, next) => {
  Order.find().populate('owner').populate('buyer')
    .then(allTheOrders => {
      res.json(allTheOrders);
    })
    .catch(err => {
      res.json(err);
    })
});


router.get('/orders/:id', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  // our projects have array of tasks' ids and 
  // we can use .populate() method to get the whole task objects
  //                                   ^
  //                                   |
  //                                   |
  Order.findById(req.params.id).populate('owner').populate('buyer')
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.json(err);
    })
})

// PUT route => to update a specific project
router.put('/orders/:id', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Order.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({ message: `Order with ${req.params.id} is updated successfully.` });
    })
    .catch(err => {
      res.json(err);
    })
})

// DELETE route => to delete a specific project
// router.delete('/orders/:id', (req, res, next)=>{

//   if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     res.status(400).json({ message: 'Specified id is not valid' });
//     return;
//   }

//   Offer.findByIdAndRemove(req.params.id)
//     .then(() => {
//       res.json({ message: `Offer with ${req.params.id} is removed successfully.` });
//     })
//     .catch( err => {
//       res.json(err);
//     })
// })

module.exports = router;