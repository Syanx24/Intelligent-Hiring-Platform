import mongoose from "mongoose";
import Application from "../models/Application.js";
import Candidate from "../models/Candidate.js";
import JobDetail from "../models/JobDetail.js";
import { isCloudinaryConfigured, uploadCloudinaryPdf } from "../config/cloudinary.js";

export async function createApplication(req, res, next) {
  try {
    if (req.user && req.user.role !== "candidate") {
      return res.status(403).json({ message: "Only candidates can submit job applications." });
    }

    const { jobId, name, email, githubUrl, resumeUrl, message } = req.body ?? {};

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "A valid job ID is required." });
    }

    const applicantName = (name || req.user?.name || "").trim();
    const applicantEmail = (req.user?.email || email || "").trim().toLowerCase();
    const applicantGithub = (githubUrl || req.user?.githubUrl || "").trim();
    let applicantResume = (resumeUrl || req.user?.resumeUrl || "").trim();

    if (
      !applicantName ||
      !applicantEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)
    ) {
      return res.status(400).json({ message: "Please provide your name and a valid email address." });
    }

    const job = await JobDetail.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "This job is no longer available." });
    }

    const priorApplicationQuery = req.user
      ? { job: jobId, $or: [{ candidateUser: req.user._id }, { email: req.user.email }] }
      : { job: jobId, email: applicantEmail };
    if (await Application.exists(priorApplicationQuery)) {
      return res.status(409).json({ message: "You have already applied to this role." });
    }

    let resumeFileName = "";
    let cloudResumeUrl = "";
    const resumeIsBase64 =
      applicantResume.startsWith("data:application/pdf;base64,") ||
      applicantResume.startsWith("data:application/octet-stream;base64,");
    if (resumeIsBase64) {
      const base64Data = applicantResume.replace(/^data:[^;]+;base64,/, "");
      const resumeBuffer = Buffer.from(base64Data, "base64");
      if (resumeBuffer.length > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Resume files cannot exceed 2MB." });
      }
      if (!isCloudinaryConfigured()) {
        return res.status(503).json({ message: "Resume uploads are not configured. Add Cloudinary credentials to the API environment." });
      }
      resumeFileName = `${applicantName.replace(/[^a-zA-Z0-9_-]/g, "_")}_CV.pdf`;
      try {
        const uploaded = await uploadCloudinaryPdf(resumeBuffer, {
          folder: "intelligent-hiring/resumes/applications",
          publicId: `${jobId}-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`,
        });
        cloudResumeUrl = uploaded.secure_url;
      } catch (error) {
        console.error("Cloudinary application resume upload failed:", error.message);
        return res.status(502).json({ message: "Could not upload resume to Cloudinary. Check the Cloudinary configuration." });
      }
      applicantResume = "";
    }

    const applicationData = {
      job: jobId,
      name: applicantName,
      email: applicantEmail,
      githubUrl: applicantGithub,
      resumeUrl: cloudResumeUrl || applicantResume,
      ...(cloudResumeUrl ? { resumeFileName } : {}),
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
        message: "You have already applied to this role.",
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
      .populate({
        path: "job",
        select: "title company companyColor companyInitials location workplace salary type category createdAt companyUser",
        populate: { path: "companyUser", select: "companyWebsite" },
      })
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

    const job = await JobDetail.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found." });
    }

    // Ownership check
    if (job.companyUser && job.companyUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view applicants for this role." });
    }

    const applicantRecords = await Application.find({ job: jobId })
      .populate("candidateUser", "name avatarUrl headline githubUrl portfolioUrl skills bio experienceYears")
      .sort({ createdAt: -1 });
    const applicants = applicantRecords.map((application) => application.toObject());

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

export async function getCompanyApplications(req, res, next) {
  try {
    const jobs = await JobDetail.find({ companyUser: req.user._id }).select("_id title category");
    const applicationRecords = await Application.find({ job: { $in: jobs.map((job) => job._id) } })
      .populate("job", "title company location workplace category type")
      .populate("candidateUser", "name avatarUrl headline githubUrl portfolioUrl resumeUrl skills bio experienceYears location")
      .sort({ createdAt: -1 });
    const applications = applicationRecords.map((application) => application.toObject());
    res.json(applications);
  } catch (error) {
    next(error);
  }
}

export async function streamApplicationResume(req, res, next) {
  try {
    const { applicationId } = req.params;
    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(applicationId).select(
      "+resumeData +resumeFileName +resumeFileSize",
    );
    if (!application) return res.status(404).json({ message: "Application not found." });

    if (application.resumeUrl?.includes("res.cloudinary.com/")) return res.redirect(application.resumeUrl);

    let data = application.resumeData;
    let fileName = application.resumeFileName;
    let fileSize = application.resumeFileSize;
    if (!data && application.candidateUser) {
      const candidate = await Candidate.findById(application.candidateUser).select(
        "+resumeData +resumeFileName +resumeFileSize +resumeContentType",
      );
      data = candidate?.resumeData;
      fileName = candidate?.resumeFileName;
      fileSize = candidate?.resumeFileSize;
    }
    if (!data) return res.status(404).json({ message: "No PDF resume found for this applicant." });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName || "resume.pdf")}"`);
    res.setHeader("Content-Length", fileSize || data.length);
    return res.send(data);
  } catch (error) {
    return next(error);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    const validStatuses = ["Applied", "Under review", "Interviewing", "Shortlisted", "Accepted", "Rejected"];
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
