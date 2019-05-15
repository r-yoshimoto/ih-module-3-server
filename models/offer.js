const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const offerSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  unity: String,
  minimum: Number, 
  category:{
    type: String,
    enum: ["Fruits", "Flowers", "Fish", "Vegetables"],
    default: "Signed"
}, 
  owner: {type: Schema.Types.ObjectId, ref: 'User'}
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;