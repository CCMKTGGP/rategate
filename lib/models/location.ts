import { Schema, model, models } from "mongoose";

const LocationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    total_members: {
      type: Number,
      default: 0,
    },
    location_payment_intent_id: {
      type: String,
      default: null,
    },
    business_id: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Location = models.Location || model("Location", LocationSchema);
export default Location;
