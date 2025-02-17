import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getAssignedTasks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const tasks = await client.task.findMany({
      where: {
        assignees: { some: { id: parseInt(userId) } }, // Fetch tasks assigned to user
      },
      include: {
        project: { select: { id: true, projectName: true } }, // Include project details
      },
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
