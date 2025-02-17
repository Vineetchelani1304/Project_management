import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const addMembers = async (req: Request, res: Response) => {
  try {
    const { projectId, userIds } = req.body; // Expecting userIds as an array

    if (!projectId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: "Invalid input: Provide projectId and an array of userIds." });
      return 
    }

    // Check if project exists
    const project = await client.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return 
    }
    const ownerId = project.ownerId;
    // Get current members' IDs
    const existingMemberIds = new Set(project.members.map(member => member.id));

    // Filter out users that are already members
    const newMembers = userIds.filter((userId) => userId !== ownerId && !existingMemberIds.has(userId));

    if (newMembers.length === 0) {
       res.status(400).json({ message: "All users are already members of this project." });
       return
    }

    await client.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: newMembers.map((id) => ({ id })) // Connect only new members
        }
      }
    });

    res.status(200).json({
      message: "Members added successfully!",
      addedMembers: newMembers,
    });
    return 

  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ message: "Internal server error", error });
    return   
}
};
