import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const addMembers = async (req: Request, res: Response) => {
  try {
    const { projectId, userIds, requesterId } = req.body; // requesterId is the user making the request

    if (!projectId || !userIds || !Array.isArray(userIds) || userIds.length === 0 || !requesterId) {
      return res.status(400).json({ message: "Invalid input: Provide projectId, userIds, and requesterId." });
    }

    // Fetch the project with members
    const project = await client.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ensure only the owner can add members
    if (project.ownerId !== requesterId) {
      return res.status(403).json({ message: "Forbidden: Only the project owner can add members." });
    }

    const existingMemberIds = new Set(project.members.map(member => member.id));

    // Filter out users that are already members or the owner
    const newMembers = userIds.filter((userId) => userId !== project.ownerId && !existingMemberIds.has(userId));

    if (newMembers.length === 0) {
      return res.status(400).json({ message: "All users are already members of this project." });
    }

    // Add new members to the project
    await client.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: newMembers.map((id) => ({ id }))
        }
      }
    });

    return res.status(200).json({
      message: "Members added successfully!",
      addedMembers: newMembers,
    });

  } catch (error) {
    console.error("Error adding members:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
