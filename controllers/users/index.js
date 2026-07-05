import repositoryUsers from '../../repository/user.js';
import { HttpCode } from '../../lib/constants.js';
import cloudStorage from '../../service/file-storage/cloud-storage.js';
import { EmailService, SenderNodemailer } from '../../service/email/index.js';
import { CLOUD_AVATAR_FOLDER } from '../../lib/constants.js';
import AppError from '../../lib/AppError.js';
import catchAsync from '../../lib/catchAsync.js';
import sendResponse from '../../lib/response.js';

const uploadAvatar = catchAsync(async (req, res) => {
  const file = req.file;
  if (!file) throw AppError.badRequest('Avatar file is required');

  const { id, idAvatarCloud } = req.user;

  // Remove old avatar if it was stored in cloud
  if (idAvatarCloud) {
    await cloudStorage.removeFiles(idAvatarCloud).catch(() => {});
  }

  const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
    CLOUD_AVATAR_FOLDER,
    file.buffer,
    file.originalname,
    id,
  );

  const result = await repositoryUsers.updateAvatar(id, fileUrl, returnedIdFileCloud);
  return sendResponse(res, HttpCode.OK, { data: result });
});

const verifyUser = catchAsync(async (req, res) => {
  const user = await repositoryUsers.findByVerifyToken(req.params.verificationToken);
  if (!user) {
    throw AppError.notFound('Verification token is invalid or has already been used');
  }
  await repositoryUsers.updateVerify(user.id, true);
  return sendResponse(res, HttpCode.OK, { data: { message: 'Email verified successfully' } });
});

const repeatEmailForVerifyUser = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw AppError.badRequest('Email is required');

  const user = await repositoryUsers.findByEmail(email);
  if (!user) throw AppError.notFound('User with this email not found');

  if (user.verify) {
    throw AppError.badRequest('Email is already verified');
  }

  const emailService = new EmailService(process.env.NODE_ENV, new SenderNodemailer());
  const isSend = await emailService.sendVerifyEmail(
    user.email,
    user.firstName,
    user.verificationToken,
  );

  if (!isSend) {
    throw AppError.create('Failed to send verification email', HttpCode.SERVICE_UNAVAILABLE);
  }

  return sendResponse(res, HttpCode.OK, { data: { message: 'Verification email sent' } });
});

export { uploadAvatar, verifyUser, repeatEmailForVerifyUser };
