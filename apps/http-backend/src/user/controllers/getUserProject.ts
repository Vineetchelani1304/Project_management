import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required." });
      return;
    }

    // Fetch projects where the user is a member
    const memberProjects = await client.project.findMany({
      where: { members: { some: { id: parseInt(userId) } } },
    });

    // Fetch projects owned by the user
    // const ownedProjects = await client.project.findMany({
    //   where: { ownerId: parseInt(userId) },
    // });

    res.status(200).json({
      message: "Projects fetched successfully.",
    //   ownedProjects,
      memberProjects,
    });
    return;

  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
};
