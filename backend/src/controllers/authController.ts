import { Request, Response } from 'express';

export const getAllUsers = (req: Request, res: Response) => {
  const users = [
    { userId: '1', username: 'david' },
    { userId: '2', username: 'janeta' }
  ];
  res.json(users);
};
