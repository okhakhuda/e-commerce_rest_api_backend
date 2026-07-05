import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { generateCode } from '../lib/generateCode.js';

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      default: () => generateCode(6),
      index: true,
      unique: true,
      sparse: true,
    },
    products: [
      {
        productId: { type: SchemaTypes.ObjectId, ref: 'product' },
        image: { type: String },
        name: { type: String },
        size: { type: String },
        color: { type: String },
        quantity: { type: Number, min: 1 },
        price: { type: Number, min: 0 },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    user: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        sparse: true,
        index: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '{VALUE} is not a valid email'],
      },
    },
    address: {
      department: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      region: {
        type: String,
        required: true,
        trim: true,
      },
      provider: {
        type: String,
        required: true,
        trim: true,
      },
    },
    // paymentMethod: {
    //   type: String,
    //   // required: true,
    //   enum: ['credit_card', 'paypal', 'bank_transfer'],
    // },
    // paymentStatus: {
    //   type: String,
    //   // required: true,
    //   enum: ['pending', 'completed', 'failed', 'refunded'],
    //   default: 'pending',
    // },
    // shippingStatus: {
    //   type: String,
    //   // required: true,
    //   enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    //   default: 'pending',
    // },
    // subtotal: {
    //   type: Number,
    //   required: true,
    //   min: 0,
    // },
    // tax: {
    //   type: Number,
    //   // required: true,
    //   min: 0,
    // },
    // shippingCost: {
    //   type: Number,
    //   // required: true,
    //   min: 0,
    // },
    isGuest: { type: Boolean, default: true },
    userId: { type: SchemaTypes.ObjectId, ref: 'user', default: null },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = model('order', orderSchema);

export default Order;
