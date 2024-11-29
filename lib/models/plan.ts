import { Schema, model, models } from "mongoose";

const PlanSchema = new Schema(
  {
    plan_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    max_reviews: {
      type: Number,
    },
    max_locations: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = models.Plan || model("Plan", PlanSchema);
export default Plan;
