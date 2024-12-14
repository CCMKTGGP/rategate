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
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    number_of_retries: {
      type: Number,
    },
    verify_token: {
      type: String,
    },
    verify_token_expire: {
      type: Date,
    },
    phone_number: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

const Business = models.Business || model("Business", BusinessSchema);
export default Business;
