import { Schema, model, models } from "mongoose";

const PreWrittenReviewSchema = new Schema(
  {
    business_id: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    location_id: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    strategy_hash: {
      type: String,
    },
    text: {
      type: String,
    },
    copied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PreWrittenReview =
  models.PreWrittenReview || model("PreWrittenReview", PreWrittenReviewSchema);
export default PreWrittenReview;
