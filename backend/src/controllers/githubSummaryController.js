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
    const repositories = await Promise.all(repos.map(async (repo) => {
      const repositoryPath = `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}`;
      const [commitsResponse, pullsResponse] = await Promise.all([
        fetch(`${repositoryPath}/commits?per_page=1`, { headers }),
        fetch(`${repositoryPath}/pulls?state=all&per_page=1`, { headers }),
      ]);
      const getCount = async (response) => {
        if (!response.ok) return null;
        const linkHeader = response.headers.get("link") || "";
        const lastPage = linkHeader.match(/[?&]page=(\d+)[^>]*>\s*;\s*rel="last"/i);
        if (lastPage) return Number(lastPage[1]);
        const firstPage = await response.json();
        return Array.isArray(firstPage) ? firstPage.length : null;
      };
      const [commitsCount, pullRequestsCount] = await Promise.all([
        getCount(commitsResponse),
        getCount(pullsResponse),
      ]);
      return {
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        commitsCount,
        pullRequestsCount,
      };
    }));

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
      totalStars: repositories.reduce((total, repo) => total + (repo.stars || 0), 0),
      repositories,
    });
  } catch (error) {
    next(error);
  }
}
