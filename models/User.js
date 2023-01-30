import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { validatorMinMax } from "../utils/utils.js";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Value must be provided"],
    validate: [
      validatorMinMax("minlength", 3),
      validatorMinMax("maxlength", 50),
    ],
  },

  email: {
    type: String,
    unique: true,
    required: [true, "Value must be provided"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },

  password: {
    type: String,
    required: [true, "Value must be provided"],
    validate: validatorMinMax("minlength", 6),
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  followers: [
    {
      type: String,
    },
  ],

  following: [
    {
      type: String,
    },
  ],

  countFollowers: {
    type: Number,
    default: 0,
  },

  countFollowing: {
    type: Number,
    default: 0,
  },

  hashedId: {
    type: String,
  },

  encodedHashedId: {
    type: String,
  },
});

UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (!this.hashedId && this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.hashedId = await bcrypt.hash(this._id.toString(), salt);
    this.encodedHashedId = encodeURIComponent(this.hashedId);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

UserSchema.methods.compareHashedId = async function (candidateId) {
  const isMatch = await bcrypt.compare(candidateId, this.hashedId);
  return isMatch;
};

const User = mongoose.model("User", UserSchema);

export default User;
