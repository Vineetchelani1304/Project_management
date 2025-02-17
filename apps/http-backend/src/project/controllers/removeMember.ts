import { Request, Response } from "express";
import { client } from "@repo/db/client";

export const removeMemberFromProject = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.body; // Expecting projectId and memberId

    if (!projectId || !memberId) {
      res.status(400).json({ message: "Invalid input: Provide projectId and memberId." });
      return;
    }

    // Fetch the project along with its owner and members
    const project = await client.project.findUnique({
      where: { id: projectId },
      include: { owner: true, members: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure the request is coming from the project owner
    const { userId } = req.body; // Assuming userId is provided in the request for authentication
    if (project.owner.id !== userId) {
      res.status(403).json({ message: "Forbidden: Only the project owner can remove members." });
      return;
    }

    // Prevent removing the owner from the project
    if (memberId === project.owner.id) {
      res.status(400).json({ message: "The owner cannot be removed from the project." });
      return;
    }

    // Check if the member exists in the project
    const isMember = project.members.some(member => member.id === memberId);
    if (!isMember) {
      res.status(400).json({ message: "User is not a member of this project." });
      return;
    }

    // Remove the member from the project
    await client.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
    });

    res.status(200).json({
      message: "Member removed successfully!",
      removedMemberId: memberId,
    });
    return;

  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
};
