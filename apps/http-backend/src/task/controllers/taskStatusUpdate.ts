import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.body; // taskId from the URL
    const { userId, status } = req.body; // userId and status to update

    if (!userId || !status) {
      res.status(400).json({ message: "Invalid input: Provide userId and status." });
      return;
    }

    // Fetch the task to check if it's assigned to the user
    const task = await client.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { assignees: true }, // Include assignees to check if user is assigned
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Check if the user is assigned to the task
    const isAssignedToTask = task.assignees.some(assignee => assignee.id === parseInt(userId));

    if (!isAssignedToTask) {
      res.status(403).json({ message: "Forbidden: You are not assigned to this task." });
      return;
    }

    // Update the task status
    const updatedTask = await client.task.update({
      where: { id: parseInt(taskId) },
      data: {
        status, // Update only the status
      },
    });

    res.status(200).json({
      message: "Task status updated successfully!",
      updatedTask,
    });
    return;

  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
};
