import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const removeTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId, userId } = req.body;

    if (!projectId || !taskId || !userId) {
      res.status(400).json({ message: "Project ID, Task ID, and User ID are required." });
      return;
    }

    // Fetch project
    const project = await client.project.findUnique({
      where: { id: parseInt(projectId) },
      select: { ownerId: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found." });
      return;
    }

    // Only the owner can remove tasks
    if (project.ownerId !== parseInt(userId)) {
      res.status(403).json({ message: "Forbidden: Only the project owner can remove tasks." });
      return;
    }

    // Delete the task
    await client.task.delete({
      where: { id: parseInt(taskId) },
    });

    res.status(200).json({ message: "Task removed successfully." });
    return;

  } catch (error) {
    console.error("Error removing task:", error);
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
};
