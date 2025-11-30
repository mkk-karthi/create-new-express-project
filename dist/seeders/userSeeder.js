import UserModel from "../models/userModel.js";

export default async () => {
  await UserModel.bulkCreate([
    {
      name: "admin",
      email: "admin@gmail.com",
    },
    {
      name: "user",
      email: "user@gmail.com",
    },
  ]);
};
