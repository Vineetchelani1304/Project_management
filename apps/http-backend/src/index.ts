import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { client } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";
import { createProject } from "./project/controllers/createProject";
import { addMember } from "./project/controllers/addMember";
const app = express();

app.use(express.json());
app.use(cors())
const SECRET_KEY = "vineet"

app.post('/signup',async(req:Request, res:Response) => {
    try {
        const { name, email, password } = req.body;
    
        // Validate input
        if (!name || !email || !password) {
          res.status(400).json({ message: "All fields are required" });
          return 
        }
    
        // Check if the user already exists
        const existingUser = await client.user.findUnique({
          where: { email },
        });
    
        if (existingUser) {
           res.status(409).json({ message: "User already exists" });
           return 
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create new user
        const newUser = await client.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
    
        res.status(201).json({ message: "User registered successfully", user: newUser });
        return  
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return  
    }
})

app.post("/login",async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return 
      }
  
      // Check if user exists
      const user = await client.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return 
      }
  
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid email or password" });
        return 
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "7d",
      });
  
      res.status(200).json({ message: "Login successful", token, user });
      return   
  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
      return   
  }
  })

app.post('/create_project',createProject);
app.post('/project/add-member',addMember);
const port = 8000;

app.listen(port,()=>{
    console.log("running on port",port)
});