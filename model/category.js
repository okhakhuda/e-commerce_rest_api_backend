import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;

const CategorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    image: { type: String },
    idFileCloud: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
    },
    genderCategory: {
      type: SchemaTypes.ObjectId,
      ref: 'genderCategory',
      required: [true, 'Gender category is required'],
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

const Category = model('category', CategorySchema);

export default Category;
