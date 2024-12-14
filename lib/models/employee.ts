import { Schema, model, models } from "mongoose";

const EmployeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    employee_id: {
      type: String,
      required: true,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    employee_subscription_id: {
      type: String,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

const Employee = models.Employee || model("Employee", EmployeeSchema);
export default Employee;
