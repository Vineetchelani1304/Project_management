import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getProjectsAsOwner = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const ownedProjects = await client.project.findMany({
      where: { ownerId: parseInt(userId) },
      include: {
        members: { select: { id: true, name: true, email: true } }, // Include members
        tasks: { select: { id: true, taskName: true, status: true } }, // Include tasks
      },
    });

    return res.status(200).json({ ownedProjects });
  } catch (error) {
    console.error("Error fetching owned projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
