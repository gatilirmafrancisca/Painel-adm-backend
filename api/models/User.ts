import mongoose, { Schema, model, Model } from "mongoose";
import { UserType, USERTYPES } from "../types/user.type.js";

export interface IUser {

    login: string;
    password: string;
    email: string;
    utype: UserType;

}

const UserSchema: Schema<IUser> = new mongoose.Schema({

    login : {
        type: String,
        required: true,
        unique: true,
    },

    password : {
        type: String,
        required: true,
        select: false
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    utype: {
        type: String,
        enum: USERTYPES,
        required: true
    }

});

const User: Model<IUser> = model("User", UserSchema);
export default User;