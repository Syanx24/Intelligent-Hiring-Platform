const githubUsernameFromUrl = (value) => {
  try {
    const parsed = new URL(value);
    if (parsed.hostname.toLowerCase() !== "github.com") return "";
    return parsed.pathname.split("/").filter(Boolean)[0] || "";
  } catch {
    return "";
  }
};

export async function getGithubSummary(req, res, next) {
  try {
    const username = githubUsernameFromUrl(String(req.query.url || ""));
    if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
      return res.status(400).json({ message: "Enter a valid GitHub profile URL." });
    }

    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Intelligent-Hiring-Platform",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    };
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5`, { headers }),
    ]);
    if (userResponse.status === 404) return res.status(404).json({ message: "GitHub profile was not found." });
    if (!userResponse.ok || !reposResponse.ok) {
      return res.status(502).json({ message: "GitHub is temporarily unavailable. Try again later." });
    }

    const user = await userResponse.json();
    const repos = await reposResponse.json();
    return res.json({
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      blog: user.blog,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
      repositories: repos.map(({ name, html_url, description, language, stargazers_count, updated_at }) => ({
        name, url: html_url, description, language, stars: stargazers_count, updatedAt: updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
}
