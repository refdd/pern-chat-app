import {Request, Response} from "express";
import prisma from "../db/prisma.js";
import { hash, compare, genSalt } from 'bcryptjs';  
import generateToken from "../utils/generateToken.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    // if (!fullName || !username || !password || !confirmPassword || !gender) {
    //   return res.status(400).json({ error: "Please fill in all fields" });
    // }

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords don't match" });
      return 
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (user) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }
    
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    // https://avatar-placeholder.iran.liara.run/
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
    
    const newUser = await prisma.user.create({
      data: {
        fullName,
        username,
        password: hashedPassword,
        gender,
        profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
      },
    });
    
    if (newUser) {
      // generate token
      generateToken(newUser.id, res);

      res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error: any) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const login = async(req: Request, res: Response) : Promise<void> => {
  try {
    const {username ,  password} = req.body
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return 
    }
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ error: "Invalid password" });
      return 
    }
    generateToken(user.id, res);
    res.status(200).json({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
      message: "User logged out successfully" });
  } catch (error:any) {
     console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error: any) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req: Request, res: Response): Promise<void>  => {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });

		if (!user) {
      res.status(404).json({ error: "User not found" });
			return
		}

		res.status(200).json({
			id: user.id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error: any) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};