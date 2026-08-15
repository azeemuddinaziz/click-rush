import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.ts";
import { JWT_SECRET } from "../utils/contants.ts";

class AuthService {
  async registerUser(username: string, email: string, passwordPlain: string) {
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) throw new Error("EMAIL_TAKEN");

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) throw new Error("USERNAME_TAKEN");

    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    return userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
  }

  async loginUser(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return {
      token,
      publicUser: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}

export const authService = new AuthService();
