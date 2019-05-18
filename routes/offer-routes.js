// routes/project-routes.js
const express = require('express');
const mongoose = require('mongoose');
const router  = express.Router();

const Offer = require('../models/offer');
const User = require('../models/user-model'); // <== !!!


// POST route => to create a new project
router.post('/offers', (req, res, next)=>{
 
  Offer.create({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    unity: req.body.unity,
    minimum: req.body.minimum, 
    category: req.body.category,
    owner: req.user._id
  })
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.json(err);
    })
});


router.get('/offers', (req, res, next) => {
  Offer.find().populate('owner')
    .then(allTheOffers => {
      res.json(allTheOffers);
    })
    .catch(err => {
      res.json(err);
    })
});


router.get('/offers/:id', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  // our projects have array of tasks' ids and 
  // we can use .populate() method to get the whole task objects
  //                                   ^
  //                                   |
  //                                   |
  Offer.findById(req.params.id).populate('owner')
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.json(err);
    })
})

// PUT route => to update a specific project
router.put('/offers/:id', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Offer.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({ message: `Offer with ${req.params.id} is updated successfully.` });
    })
    .catch(err => {
      res.json(err);
    })
})

// DELETE route => to delete a specific project
router.delete('/offers/:id', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Offer.findByIdAndRemove(req.params.id)
    .then(() => {
      res.json({ message: `Offer with ${req.params.id} is removed successfully.` });
    })
    .catch( err => {
      res.json(err);
    })
})

module.exports = router;