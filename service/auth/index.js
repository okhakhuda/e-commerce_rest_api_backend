import Users from '../../repository/user.js';
import jwt from 'jsonwebtoken';

class AuthService {
  async isUserExist(email, phone) {
    console.log('Checking if user exists...', email, phone);
    const [byEmail, byPhone] = await Promise.all([
      Users.findByEmail(email),
      Users.findByPhone(phone),
    ]);
    return !!(byEmail || byPhone);
  }

  async create(body) {
    const { id, firstName, lastName, phone, email, token, role, avatarUrl, verificationToken } =
      await Users.create(body);
    return { id, firstName, lastName, phone, email, token, role, avatarUrl, verificationToken };
  }

  async getUser(email, password) {
    const user = await Users.findByEmail(email);
    if (!user || !user.verify) return null;
    const isValidPassword = await user.isValidPassword(password);
    return isValidPassword ? user : null;
  }

  getToken(user) {
    const { id, email } = user;
    return jwt.sign({ id, email }, process.env.JWT_SECRET_KEY, { expiresIn: '8h' });
  }

  async setToken(id, token) {
    await Users.updateToken(id, token);
  }

  async removeUser(id) {
    const user = await Users.findOneAndDelete(id);
    return user;
  }
}

export default new AuthService();
