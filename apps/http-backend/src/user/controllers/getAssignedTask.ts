import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getAssignedTasks = async (req: Request, res: Response) => {
  try {
    const { userId, requesterId } = req.body; // requesterId is the ID of the user making the request

    if (!userId || !requesterId) {
      return res.status(400).json({ message: "User ID and requester ID are required" });
    }

    const requester = await client.user.findUnique({
      where: { id: parseInt(requesterId) },
      select: { role: true },
    });

    if (!requester) {
      return res.status(404).json({ message: "Requester not found" });
    }

    // If the requester is NOT an admin and is trying to access another user's tasks, deny access
    if (requester.role !== "admin" && parseInt(requesterId) !== parseInt(userId)) {
      return res.status(403).json({ message: "Forbidden: You can only access your own tasks" });
    }

    // Fetch tasks assigned to the target user
    const tasks = await client.task.findMany({
      where: {
        assignees: { some: { id: parseInt(userId) } }, // Fetch tasks assigned to the user
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
