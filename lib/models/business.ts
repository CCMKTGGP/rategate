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
    phone_number: {
      type: String,
    },
    platforms: {
      type: {
        name: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Business = models.Business || model("Business", BusinessSchema);
export default Business;
