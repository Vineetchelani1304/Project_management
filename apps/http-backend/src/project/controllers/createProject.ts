import { client } from "@repo/db/client";
import { Request, Response } from "express";
export const createProject = async(req: Request, res: Response)=>{
try {
    const {projectName,description,ownerId} = req.body;
    if(!projectName || !description || !ownerId){
        res.status(404).json({message:"all field are required"});
        return;
    }

    const isUser = await client.user.findFirst({
        where:{
            id: ownerId,
        }
    })

    if(!isUser){
        res.status(401).json({message:"no user"})
        return;
    }

    const existingProject = await client.project.findFirst({
        where:{projectName:projectName}
    })
    if(existingProject){
        res.status(403).json({message:"project already exists"})
        return;
    }
    const newProject = await client.project.create({
        data: {
            projectName:projectName,
            description:description,
            status:"pending",
            ownerId:ownerId,
        }
    })
    if(!newProject){
        res.status(400).json({
            message : "can't create project"
        })
        return;
    }
    res.status(200).json({
        message : "project created successfully",
        newProject
    })
} catch (error) {
    console.log("error occured", error);
    res.status(500).json({message:"something went wrong", error});
    return;
}
}