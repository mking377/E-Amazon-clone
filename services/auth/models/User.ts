// services/auth/models/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin" | "support" | "moderator" | "manager";
  isVerified: boolean;
  lastLogin?: Date;
  avatar?: string;
  refreshTokens?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "superadmin", "support", "moderator", "manager"],
        message: "Role must be one of: user, admin, superadmin, support, moderator, manager",
      },
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    refreshTokens: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshToken",
    }],
  },
  { timestamps: true }
);

// إضافة indexes
UserSchema.index({ role: 1 });

// تشفير كلمة المرور
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقارنة كلمة المرور
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// static method
UserSchema.statics.findByRole = function (role: string) {
  return this.find({ role });
};

export default mongoose.model<IUser>("User", UserSchema);





/*

import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin" | "support" | "moderator" | "manager";
  isVerified: boolean;
  lastLogin?: Date;
  avatar?: string;
  refreshTokens?: mongoose.Types.ObjectId[]; // اختياري للربط مع RefreshToken
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
      ],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "superadmin", "support", "moderator", "manager"],
        message: "Role must be one of: user, admin, superadmin, support, moderator, manager",
      },
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    refreshTokens: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshToken",
    }],
  },
  { timestamps: true }
);

// إضافة indexes للأداء
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// تشفير كلمة المرور قبل الحفظ
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقارنة كلمة المرور
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// static method للعثور على مستخدمين حسب الدور
UserSchema.statics.findByRole = function (role: string) {
  return this.find({ role });
};

export default mongoose.model<IUser>("User", UserSchema);

*/
/*


import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin" | "support" | "moderator" | "manager";
  isVerified: boolean;
  lastLogin?: Date; // حقل إضافي لتتبع آخر تسجيل دخول
  avatar?: string; // حقل إضافي للصورة الرمزية (اختياري)
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
      ],
      select: false, // عدم إرجاع كلمة المرور في الاستعلامات الافتراضية
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "superadmin", "support", "moderator", "manager"],
        message: "Role must be one of: user, admin, superadmin, support, moderator, manager",
      },
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: null, // رابط للصورة الرمزية
    },
  },
  { timestamps: true }
);

// إضافة indexes للأداء
UserSchema.index({ email: 1 }); // index على البريد الإلكتروني للبحث السريع
UserSchema.index({ role: 1 }); // index على الدور للتصفية

// تشفير كلمة المرور قبل الحفظ (مع تحسينات)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12); // زيادة الـ salt rounds لأمان أفضل
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // تمرير الخطأ إلى Mongoose
  }
});

// مقارنة كلمة المرور عند تسجيل الدخول (مع تحسينات)
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// static method للعثور على مستخدمين حسب الدور
UserSchema.statics.findByRole = function (role: string) {
  return this.find({ role });
};

interface IUserModel extends mongoose.Model<IUser> {
  findByRole(role: string): Promise<IUser[]>;
}

export default mongoose.model<IUser, IUserModel>("User", UserSchema);

*/

/*

// مقارنة كلمة المرور عند تسجيل الدخول (مع تحسينات)
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};


// static method للعثور على مستخدمين حسب الدور (مثال إضافي)
interface IUserModel extends mongoose.Model<IUser> {
  findByRole(role: string): Promise<IUser[]>;
}
export default mongoose.model<IUser, IUserModel>("User", UserSchema);



UserSchema.statics.findByRole = function (role: string) {
  return this.find({ role });
};

export default mongoose.model<IUser>("User", UserSchema);

*/
/*

import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin" | "support" | "moderator" | "manager";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastPasswordChange?: Date;       // ✅ آخر مرة غير فيها الباسورد
  passwordChangeCount?: number;    // ✅ عدد مرات تغيير الباسورد
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "support", "moderator", "manager"],
      default: "user",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastPasswordChange: { type: Date, default: null }, // ✅ مبدئيًا null
    passwordChangeCount: { type: Number, default: 0 }, // ✅ يبدأ من 0
  },
  { collection: "users", timestamps: true } // ✅ يضيف createdAt و updatedAt
);

export default mongoose.model<IUser>("User", userSchema);



*/
