import { Request, Response } from 'express';

let users: any[] = [];

export const getAllUsers = (req: Request, res: Response) => {
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json({ message: 'Usuario creado', user: newUser });
};
