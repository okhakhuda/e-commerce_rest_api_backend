import User from '../model/user.js';

const findById = id => User.findById(id);

const findByEmail = email => User.findOne({ email });

const findByPhone = phone => User.findOne({ phone });

const findByVerifyToken = verificationToken => User.findOne({ verificationToken });

const create = async body => {
  const user = new User(body);
  return user.save();
};

const updateToken = (id, token) => User.updateOne({ _id: id }, { token });

const updateVerify = (id, status) =>
  User.updateOne({ _id: id }, { verify: status, verificationToken: null });

const updateAvatar = (id, avatarUrl, idAvatarCloud = null) =>
  User.findByIdAndUpdate(id, { avatarUrl, idAvatarCloud }, { new: true });

export default {
  findById,
  findByEmail,
  findByPhone,
  create,
  updateToken,
  updateAvatar,
  findByVerifyToken,
  updateVerify,
};
