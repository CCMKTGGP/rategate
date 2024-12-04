import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
    },
    business_id: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
    location_id: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Review = models.Review || model("Review", ReviewSchema);
export default Review;
