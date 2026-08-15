import type { User } from "../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
  }
}

export const userRepository = new UserRepository();
