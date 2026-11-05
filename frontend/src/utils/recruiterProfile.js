export function getRecruiterProfileCompleteness(profile = {}) {
  const items = [
    { label: "Full name", complete: Boolean(profile.name?.trim()) },
    { label: "Position at company", complete: Boolean(profile.position?.trim()) },
    { label: "Personal profile photo", complete: Boolean(profile.avatarUrl?.trim()) },
    { label: "Company name", complete: Boolean(profile.companyName?.trim()) },
    { label: "Company website", complete: Boolean(profile.companyWebsite?.trim()) },
    { label: "Headquarters location", complete: Boolean(profile.companyLocation?.trim()) },
    { label: "Company size", complete: Boolean(profile.companySize?.trim()) },
    { label: "Company mission and culture", complete: Boolean(profile.companyDescription?.trim()) },
  ];

  const completedCount = items.filter((item) => item.complete).length;
  return {
    items,
    missing: items.filter((item) => !item.complete).map((item) => item.label),
    percentage: Math.round((completedCount / items.length) * 100),
    isComplete: completedCount === items.length,
  };
}
