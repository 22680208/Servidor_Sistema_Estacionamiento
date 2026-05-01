import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    preferences: {
        theme: { type: String, enum: ["light", "dark"], default: "light" },
        notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Profile", profileSchema);
