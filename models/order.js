const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const orderSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  unity: String,
  minimum: Number, 
  total: Number,
  category:{
    type: String,
    enum: ["Fruits", "Flowers", "Fish", "Vegetables", "None of above"],
    default: "None of Above"
}, 
  owner: {type: Schema.Types.ObjectId, ref: 'User'},
  buyer: {type: Schema.Types.ObjectId, ref: 'User'},
  courier: {type: Schema.Types.ObjectId, ref: 'User'},
  category:{
    type: String,
    enum: ["Waiting courier confirmation", "Confirmed", "Out for delivery", "Delivered", "Cancelled"],
    default: ""
}
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;