import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { generateCode } from '../lib/generateCode.js';

const productsSchema = new Schema(
  {
    article: {
      type: String,
      required: [true, 'Set article for product'],
      default: () => generateCode(7),
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Set name for product'],
      trim: true,
    },
    quantity: {
      type: Number,
      default: null,
      min: [0, 'Quantity cannot be negative'],
    },
    color: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
    },
    sizeList: [{ type: String }],
    image: [
      {
        url: {
          type: String,
        },
        idFileCloud: {
          type: String,
          default: null,
        },
      },
    ],
    category: {
      type: SchemaTypes.ObjectId,
      ref: 'category',
      required: [true, 'Category is required'],
    },
    genderCategory: {
      type: SchemaTypes.ObjectId,
      ref: 'genderCategory',
      required: [true, 'Gender category is required'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
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

productsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

productsSchema.virtual('status').get(function () {
  if (this.quantity === null || this.quantity === undefined) return 'Невідомо';
  if (this.quantity <= 5) return 'Закінчення товару';
  return 'Є в наявності';
});

const Product = model('product', productsSchema);

export default Product;
