import { Schema, model, models } from "mongoose";

const BusinessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    phone_number: {
      type: String,
    },
    logo_url: {
      type: String,
      default: null,
    },
    platforms: {
      type: Array<{
        id: String;
        name: String;
        url: String;
        total_reviews: Number;
      }>,
    },
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    subscription_id: {
      type: String,
      default: null,
    },
    review_redirect: {
      type: String,
      default: null,
    },
    business_strategy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Business = models.Business || model("Business", BusinessSchema);
export default Business;
