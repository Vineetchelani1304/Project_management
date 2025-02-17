import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getAssignedTasks = async (req: Request, res: Response) => {
  try {
    const { userId, requesterId } = req.body; // requesterId is the ID of the user making the request

    if (!userId || !requesterId) {
      res.status(400).json({ message: "User ID and requester ID are required" });
      return 
    }

    const requester = await client.user.findUnique({
      where: { id: parseInt(requesterId) },
      select: { role: true },
    });

    if (!requester) {
       res.status(404).json({ message: "Requester not found" });
       return
    }

    // If the requester is NOT an admin and is trying to access another user's tasks, deny access
    if (requester.role !== "admin" && parseInt(requesterId) !== parseInt(userId)) {
       res.status(403).json({ message: "Forbidden: You can only access your own tasks" });
       return
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

     res.status(200).json({ tasks });
     return
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
     res.status(500).json({ message: "Internal server error" });
     return
    }
};
