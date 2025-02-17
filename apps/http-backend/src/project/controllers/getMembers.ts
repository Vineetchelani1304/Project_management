import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ message: "Project ID is required." });
      return;
    }

    const project = await client.project.findUnique({
      where: { id: parseInt(projectId) },
      include: { members: { select: { id: true, name: true, email: true } } },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found." });
      return;
    }

    res.status(200).json({
      message: "Project members fetched successfully.",
      members: project.members,
    });
    return;

  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
};
