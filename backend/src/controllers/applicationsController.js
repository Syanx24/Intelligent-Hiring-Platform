import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

export async function createApplication(req, res, next) {
  try {
    const { jobId, name, email, githubUrl, resumeUrl, message } = req.body ?? {};

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "A valid job ID is required." });
    }

    const applicantName = (name || req.user?.name || "").trim();
    const applicantEmail = (email || req.user?.email || "").trim().toLowerCase();
    const applicantGithub = (githubUrl || req.user?.githubUrl || "").trim();
    const applicantResume = (resumeUrl || req.user?.resumeUrl || "").trim();

    if (
      !applicantName ||
      !applicantEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)
    ) {
      return res.status(400).json({ message: "Please provide your name and a valid email address." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "This job is no longer available." });
    }

    const applicationData = {
      job: jobId,
      name: applicantName,
      email: applicantEmail,
      githubUrl: applicantGithub,
      resumeUrl: applicantResume,
      message: (message ?? "").trim(),
      status: "Applied",
    };

    if (req.user) {
      applicationData.candidateUser = req.user._id;
    }

    const application = await Application.create(applicationData);

    res.status(201).json({
      message: "Your application has been submitted successfully.",
      applicationId: application.id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied to this role with this email.",
      });
    }
    next(error);
  }
}

export async function getMyApplications(req, res, next) {
  try {
    const query = {
      $or: [
        { candidateUser: req.user._id },
        { email: req.user.email },
      ],
    };

    const applications = await Application.find(query)
      .populate("job", "title company companyColor companyInitials location workplace salary type category")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

export async function getJobApplicants(req, res, next) {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found." });
    }

    // Ownership check
    if (job.companyUser && job.companyUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view applicants for this role." });
    }

    const applicants = await Application.find({ job: jobId })
      .populate("candidateUser", "headline githubUrl portfolioUrl skills bio experienceYears")
      .sort({ createdAt: -1 });

    res.json({
      jobTitle: job.title,
      company: job.company,
      totalApplicants: applicants.length,
      applicants,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    const validStatuses = ["Applied", "Under review", "Interviewing", "Accepted", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Verify company ownership of the job
    if (
      application.job?.companyUser &&
      application.job.companyUser.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You are not authorized to update this applicant's status." });
    }

    application.status = status;
    await application.save();

    res.json({
      message: `Applicant status updated to ${status}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
}
