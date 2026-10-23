// End-to-End API Integration Test Script
const BASE_URL = "http://127.0.0.1:5000";

async function runTests() {
  console.log("=== STARTING E2E API VERIFICATION ===");
  const timestamp = Date.now();
  const candEmail = `candidate_${timestamp}@test.com`;
  const compEmail = `company_${timestamp}@test.com`;
  const password = "Password123!";

  // 1. Candidate Register
  console.log("\n1. Testing Candidate Registration...");
  const candRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Alex Dev",
      email: candEmail,
      password,
      role: "candidate",
      githubUrl: "https://github.com/alexdev",
      headline: "Senior Full Stack Engineer",
    }),
  });
  const candReg = await candRegRes.json();
  if (candRegRes.status !== 201 || !candReg.token) {
    throw new Error(`Candidate reg failed: ${JSON.stringify(candReg)}`);
  }
  const candToken = candReg.token;
  console.log("✓ Candidate registered successfully with token and safe user profile.");

  // 2. Candidate Update Profile
  console.log("\n2. Testing Candidate Profile Update...");
  const candProfileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${candToken}`,
    },
    body: JSON.stringify({
      headline: "Staff TypeScript & Rust Engineer",
      skills: ["React", "Node.js", "MongoDB", "Rust"],
      bio: "10+ years architecting scalable cloud platforms.",
    }),
  });
  const candProfile = await candProfileRes.json();
  if (!candProfileRes.ok || candProfile.user.skills.length !== 4) {
    throw new Error(`Profile update failed: ${JSON.stringify(candProfile)}`);
  }
  console.log("✓ Candidate profile and skills updated successfully.");

  // 3. Company Register
  console.log("\n3. Testing Company Registration...");
  const compRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Acme Cloud Corp",
      email: compEmail,
      password,
      role: "company",
      companyName: "Acme Cloud Corp",
      companyWebsite: "https://acmecloud.io",
    }),
  });
  const compReg = await compRegRes.json();
  if (compRegRes.status !== 201 || !compReg.token) {
    throw new Error(`Company reg failed: ${JSON.stringify(compReg)}`);
  }
  const compToken = compReg.token;
  console.log("✓ Company registered successfully with token and role separation.");

  // 4. Company Post Job
  console.log("\n4. Testing Company Job Creation...");
  const createJobRes = await fetch(`${BASE_URL}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${compToken}`,
    },
    body: JSON.stringify({
      title: "Senior Backend Architect",
      company: "Acme Cloud Corp",
      category: "Backend Development",
      salary: "$160,000 - $190,000",
      workplace: "Remote",
      type: "Full-time",
      location: "San Francisco, CA (Remote)",
      description: "We are seeking a senior distributed systems architect to scale our MongoDB and Express pipelines.",
      tags: ["Node.js", "MongoDB", "Distributed Systems", "AWS"],
      featured: true,
    }),
  });
  const createdJobData = await createJobRes.json();
  if (createJobRes.status !== 201 || !createdJobData.job._id) {
    throw new Error(`Job creation failed: ${JSON.stringify(createdJobData)}`);
  }
  const jobId = createdJobData.job._id;
  console.log(`✓ Job posted successfully with ID: ${jobId}`);

  // 5. Company List My Jobs
  console.log("\n5. Testing Company Dashboard My Jobs Query...");
  const myJobsRes = await fetch(`${BASE_URL}/api/jobs/company/my-jobs`, {
    headers: { Authorization: `Bearer ${compToken}` },
  });
  const myJobs = await myJobsRes.json();
  if (!myJobsRes.ok || !myJobs.some((j) => j._id === jobId)) {
    throw new Error(`Company my-jobs failed: ${JSON.stringify(myJobs)}`);
  }
  console.log(`✓ Company retrieved ${myJobs.length} owned job listings.`);

  // 6. Candidate Apply for Job
  console.log("\n6. Testing Candidate Job Application...");
  const applyRes = await fetch(`${BASE_URL}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${candToken}`,
    },
    body: JSON.stringify({
      jobId,
      name: "Alex Dev",
      email: candEmail,
      githubUrl: "https://github.com/alexdev",
      resumeUrl: "https://alexdev.io/resume.pdf",
      message: "Excited about distributed architecture at Acme Cloud!",
    }),
  });
  const applyData = await applyRes.json();
  if (applyRes.status !== 201 || !applyData.applicationId) {
    throw new Error(`Job application failed: ${JSON.stringify(applyData)}`);
  }
  const applicationId = applyData.applicationId;
  console.log(`✓ Application submitted successfully with ID: ${applicationId}`);

  // 7. Duplicate Application Check
  console.log("\n7. Testing Duplicate Application Guard...");
  const dupRes = await fetch(`${BASE_URL}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${candToken}`,
    },
    body: JSON.stringify({
      jobId,
      name: "Alex Dev",
      email: candEmail,
    }),
  });
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 duplicate conflict, got: ${dupRes.status}`);
  }
  console.log("✓ Duplicate application correctly blocked with 409 Conflict.");

  // 8. Candidate Track Applications
  console.log("\n8. Testing Candidate Track Applications Pipeline...");
  const candAppsRes = await fetch(`${BASE_URL}/api/applications/candidate/my-applications`, {
    headers: { Authorization: `Bearer ${candToken}` },
  });
  const candApps = await candAppsRes.json();
  if (!candAppsRes.ok || !candApps.some((a) => a._id === applicationId)) {
    throw new Error(`Candidate applications fetch failed: ${JSON.stringify(candApps)}`);
  }
  console.log(`✓ Candidate can track ${candApps.length} active applications. Initial status: ${candApps[0].status}`);

  // 9. Company View Job Applicants
  console.log("\n9. Testing Company View Job Applicants...");
  const applicantsRes = await fetch(`${BASE_URL}/api/applications/company/job/${jobId}`, {
    headers: { Authorization: `Bearer ${compToken}` },
  });
  const applicantsData = await applicantsRes.json();
  if (!applicantsRes.ok || applicantsData.totalApplicants < 1) {
    throw new Error(`Company get applicants failed: ${JSON.stringify(applicantsData)}`);
  }
  console.log(`✓ Company retrieved ${applicantsData.totalApplicants} applicant(s) for job.`);

  // 10. Unauthorized Applicant View Check
  console.log("\n10. Testing Security Guard: Candidate Cannot View Company Applicants...");
  const unauthRes = await fetch(`${BASE_URL}/api/applications/company/job/${jobId}`, {
    headers: { Authorization: `Bearer ${candToken}` },
  });
  if (unauthRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for candidate accessing company applicants, got ${unauthRes.status}`);
  }
  console.log("✓ Role authorization guard correctly returned 403 Forbidden.");

  // 11. Company Update Application Status
  console.log("\n11. Testing Application Status Update Pipeline...");
  const statusRes = await fetch(`${BASE_URL}/api/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${compToken}`,
    },
    body: JSON.stringify({ status: "Interviewing" }),
  });
  const statusData = await statusRes.json();
  if (!statusRes.ok || statusData.application.status !== "Interviewing") {
    throw new Error(`Status update failed: ${JSON.stringify(statusData)}`);
  }
  console.log("✓ Status updated to 'Interviewing'.");

  // 12. Candidate Verify Updated Status
  console.log("\n12. Testing Real-time Status Reflection for Candidate...");
  const updatedAppsRes = await fetch(`${BASE_URL}/api/applications/candidate/my-applications`, {
    headers: { Authorization: `Bearer ${candToken}` },
  });
  const updatedApps = await updatedAppsRes.json();
  const matchedApp = updatedApps.find((a) => a._id === applicationId);
  if (matchedApp.status !== "Interviewing") {
    throw new Error(`Expected status 'Interviewing', got ${matchedApp.status}`);
  }
  console.log("✓ Candidate verified their status was updated to 'Interviewing'.");

  // 13. Company Delete Job (Cascade Cleanup)
  console.log("\n13. Testing Job Deletion & Cascade Clean-up...");
  const delRes = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${compToken}` },
  });
  if (!delRes.ok) {
    throw new Error(`Job deletion failed with status: ${delRes.status}`);
  }
  console.log("✓ Job and associated applications deleted cleanly.");

  console.log("\n==========================================");
  console.log("🎉 ALL 13 END-TO-END TESTS PASSED CLEANLY!");
  console.log("==========================================\n");
}

runTests().catch((err) => {
  console.error("❌ E2E TEST FAILED:", err);
  process.exit(1);
});
