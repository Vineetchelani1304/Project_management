import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getProjectProgress = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      res.status(400).json({ message: "Project ID is required." });
      return;
    }

    // Fetch project and its tasks
    const project = await client.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        tasks: { select: { status: true } }, 
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found." });
      return;
    }

    const tasks = project.tasks;
    if (tasks.length === 0) {
      res.status(200).json({ message: "No tasks found in this project.", progress: 0 });
      return;
    }

    // Count task statuses
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "Completed").length;

    // Calculate progress percentage
    const progress = Math.round((completedTasks / totalTasks) * 100);

    res.status(200).json({
      message: "Project progress calculated successfully.",
      projectId: project.id,
      totalTasks,
      completedTasks,
      progress, // Percentage completed
    });
    return;

  } catch (error) {
    console.error("Error calculating project progress:", error);
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
};
