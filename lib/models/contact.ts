import { Schema, model, models } from "mongoose";

const ContactSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    business_id: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
    review_id: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = models.Contact || model("Contact", ContactSchema);
export default Contact;
