import { Schema, model, models } from "mongoose";

const SurveySchema = new Schema(
  {
    hear_from: {
      type: String,
    },
    current_feedback_collection: {
      type: String,
    },
    feedback_frequency: {
      type: String,
    },
    business_id: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
  },
  {
    timestamps: true,
  }
);

const Survey = models.Survey || model("Survey", SurveySchema);
export default Survey;
