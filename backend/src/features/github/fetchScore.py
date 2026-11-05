#!/usr/bin/env python3
"""
GitHub Candidate Analyzer
-------------------------
A single-file, recruitment-oriented analyzer for PUBLIC GitHub profile data.

Install:
    python -m pip install requests

Run:
    python github_candidate_analyzer.py
    python github_candidate_analyzer.py https://github.com/octocat

Optional (recommended): set a GitHub token to increase API rate limits.
PowerShell:
    $env:GITHUB_TOKEN="YOUR_TOKEN"
Command Prompt:
    set GITHUB_TOKEN=YOUR_TOKEN
macOS/Linux:
    export GITHUB_TOKEN="YOUR_TOKEN"

The script prints a report and saves a JSON file in the current directory.

Important:
- Only public data accessible to the supplied token is analyzed.
- This is an evidence/indicator report, not a definitive measure of ability.
- Commit counts are requested per author and repository on the default branch.
- Repository analysis is limited to the most recently updated repositories.
"""

import json
import os
import re
import sys
import time
from contextlib import redirect_stdout
from collections import Counter
from datetime import datetime, timezone
from getpass import getpass
from urllib.parse import urlparse

import requests


API = "https://api.github.com"
TIMEOUT = 20
MAX_REPOSITORIES_TO_ANALYZE = 15
PER_PAGE = 100


class GitHubAPI:
    def __init__(self, token=None):
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "College-Placement-GitHub-Analyzer/1.0",
        })
        if token:
            self.session.headers["Authorization"] = f"Bearer {token}"

    def get(self, path, params=None, allow_404=False):
        url = path if path.startswith("https://") else f"{API}{path}"
        try:
            response = self.session.get(url, params=params, timeout=TIMEOUT)
        except requests.RequestException as exc:
            raise RuntimeError(f"Network error calling GitHub: {exc}") from exc

        if response.status_code == 404 and allow_404:
            return None, response
        if response.status_code == 403 and response.headers.get("X-RateLimit-Remaining") == "0":
            reset = response.headers.get("X-RateLimit-Reset")
            when = ""
            if reset:
                when = " Rate limit resets at " + datetime.fromtimestamp(
                    int(reset), timezone.utc
                ).strftime("%Y-%m-%d %H:%M UTC") + "."
            raise RuntimeError(
                "GitHub API rate limit reached." + when +
                " Set a GITHUB_TOKEN environment variable and try again."
            )
        if response.status_code >= 400:
            message = ""
            try:
                message = response.json().get("message", "")
            except ValueError:
                pass
            raise RuntimeError(
                f"GitHub API error {response.status_code} for {response.url}: {message}"
            )
        if not response.content:
            return None, response
        try:
            return response.json(), response
        except ValueError as exc:
            raise RuntimeError(f"GitHub returned an unreadable response for {url}") from exc

    def get_all_pages(self, path, params=None, max_pages=3):
        params = dict(params or {})
        params.setdefault("per_page", PER_PAGE)
        results = []
        for page in range(1, max_pages + 1):
            params["page"] = page
            data, response = self.get(path, params=params)
            if not isinstance(data, list):
                break
            results.extend(data)
            if len(data) < params["per_page"] or "next" not in response.links:
                break
        return results

    @staticmethod
    def last_page_from_link(response):
        last = response.links.get("last", {}).get("url")
        if not last:
            return 1
        match = re.search(r"[?&]page=(\d+)", last)
        return int(match.group(1)) if match else 1


def parse_username(value):
    value = value.strip()
    if not value:
        raise ValueError("No GitHub URL or username supplied.")
    if "://" not in value and "/" not in value:
        username = value
    else:
        parsed = urlparse(value if "://" in value else "https://" + value)
        if parsed.netloc.lower() not in ("github.com", "www.github.com"):
            raise ValueError("Please provide a github.com profile URL or username.")
        parts = [part for part in parsed.path.split("/") if part]
        if not parts:
            raise ValueError("The URL does not contain a GitHub username.")
        username = parts[0]
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?", username):
        raise ValueError("That does not look like a valid GitHub username.")
    return username


def safe_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def days_since(value):
    date = safe_date(value)
    if not date:
        return None
    return max(0, (datetime.now(timezone.utc) - date).days)


def count_endpoint(api, path, params=None):
    """Count endpoint results using GitHub's Link pagination when available."""
    params = dict(params or {})
    params["per_page"] = 1
    data, response = api.get(path, params=params)
    if not isinstance(data, list):
        return 0
    if not data:
        return 0
    return api.last_page_from_link(response)


def analyze_repository(api, repo, username):
    owner = repo["owner"]["login"]
    name = repo["name"]
    full_name = repo["full_name"]
    base = f"/repos/{full_name}"

    result = {
        "id": repo.get("id"),
        "name": name,
        "fullName": full_name,
        "url": repo.get("html_url"),
        "description": repo.get("description"),
        "isFork": repo.get("fork", False),
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "watchers": repo.get("watchers_count", 0),
        "openIssues": repo.get("open_issues_count", 0),
        "sizeKB": repo.get("size", 0),
        "defaultBranch": repo.get("default_branch"),
        "createdAt": repo.get("created_at"),
        "updatedAt": repo.get("updated_at"),
        "pushedAt": repo.get("pushed_at"),
        "daysSinceLastPush": days_since(repo.get("pushed_at")),
        "hasWiki": repo.get("has_wiki", False),
        "hasPages": repo.get("has_pages", False),
        "license": (repo.get("license") or {}).get("spdx_id"),
        "topics": repo.get("topics", []),
        "primaryLanguage": repo.get("language"),
        "languages": {},
        "readme": {"exists": False, "size": 0},
        "rootFiles": [],
        "hasTestsEvidence": False,
        "hasDependencyFile": False,
        "authorCommitCount": None,
        "contributorsReturned": None,
        "analysisNotes": [],
    }

    # Language bytes by repository. These are not skill-level measurements.
    try:
        languages, _ = api.get(base + "/languages")
        result["languages"] = languages or {}
    except RuntimeError as exc:
        result["analysisNotes"].append(f"Languages unavailable: {exc}")

    # README presence and size; content itself is not stored.
    try:
        readme, _ = api.get(base + "/readme", allow_404=True)
        if readme:
            result["readme"] = {
                "exists": True,
                "size": readme.get("size", 0),
                "name": readme.get("name"),
                "url": readme.get("html_url"),
            }
    except RuntimeError as exc:
        result["analysisNotes"].append(f"README check unavailable: {exc}")

    # Inspect only the root directory to identify common project evidence.
    try:
        contents, _ = api.get(base + "/contents")
        if isinstance(contents, list):
            names = [item.get("name", "") for item in contents]
            result["rootFiles"] = names[:100]
            lower_names = {n.lower() for n in names}
            result["hasTestsEvidence"] = any(
                n in lower_names for n in ("test", "tests", "__tests__", "spec")
            )
            result["hasDependencyFile"] = any(
                n in lower_names for n in (
                    "package.json", "requirements.txt", "pyproject.toml",
                    "pom.xml", "build.gradle", "go.mod", "cargo.toml",
                    "composer.json", "gemfile"
                )
            )
    except RuntimeError as exc:
        result["analysisNotes"].append(f"Root contents unavailable: {exc}")

    # Count commits attributed by GitHub to this author on the repository's
    # default branch. GitHub's commit search/pagination can have edge cases.
    try:
        count = count_endpoint(
            api, base + "/commits", {"author": username}
        )
        result["authorCommitCount"] = count
    except RuntimeError as exc:
        result["analysisNotes"].append(f"Commit count unavailable: {exc}")

    # Contributors endpoint may return at most 100 entries in this request.
    try:
        contributors, _ = api.get(base + "/contributors", params={"per_page": 100})
        result["contributorsReturned"] = len(contributors) if isinstance(contributors, list) else 0
    except RuntimeError as exc:
        result["analysisNotes"].append(f"Contributor data unavailable: {exc}")

    return result


def score_profile(profile, repositories, language_totals):
    """
    A deliberately conservative 0-100 indicator score.
    It rewards observable project evidence and activity, not popularity alone.
    This is not an AI code review and must not be used as an automatic hiring decision.
    """
    original = [r for r in repositories if not r.get("isFork")]
    if not repositories:
        return {
            "total": None,
            "message": "Not scored: no public repositories were available for analysis.",
            "breakdown": {},
        }

    # Project evidence: README, dependency manifest, tests, and meaningful size.
    quality_points = []
    for repo in original:
        points = 0
        points += 35 if repo["readme"]["exists"] else 0
        points += 25 if repo["hasDependencyFile"] else 0
        points += 20 if repo["hasTestsEvidence"] else 0
        points += 20 if repo["sizeKB"] >= 100 else 0
        quality_points.append(points)
    project_quality = round(sum(quality_points) / len(quality_points)) if quality_points else 0

    # Language breadth is only a signal of exposure, not proficiency.
    language_count = len(language_totals)
    technical_breadth = min(100, language_count * 15)

    # Activity score from recency of pushes in analyzed repositories.
    push_days = [r["daysSinceLastPush"] for r in repositories if r["daysSinceLastPush"] is not None]
    if push_days:
        recent_ratio = sum(1 for d in push_days if d <= 90) / len(push_days)
        activity_score = round(recent_ratio * 70 + min(len(push_days), 5) * 6)
    else:
        activity_score = 0

    # Collaboration evidence: contributor diversity, capped to avoid popularity bias.
    contributor_values = [
        r["contributorsReturned"] for r in repositories
        if r["contributorsReturned"] is not None
    ]
    collaboration_score = min(100, round(
        (sum(max(0, n - 1) for n in contributor_values) / max(1, len(contributor_values))) * 20
    )) if contributor_values else 0

    # Small repository portfolio signal. Avoid rewarding huge repo counts heavily.
    portfolio_score = min(100, len(original) * 12)

    breakdown = {
        "projectEvidence": project_quality,
        "technicalBreadth": technical_breadth,
        "recentActivity": activity_score,
        "collaborationEvidence": collaboration_score,
        "originalProjectPortfolio": portfolio_score,
    }
    weights = {
        "projectEvidence": 0.35,
        "technicalBreadth": 0.20,
        "recentActivity": 0.20,
        "collaborationEvidence": 0.10,
        "originalProjectPortfolio": 0.15,
    }
    total = round(sum(breakdown[k] * weights[k] for k in weights))
    return {
        "total": total,
        "label": "Indicative GitHub evidence score (0-100)",
        "breakdown": breakdown,
        "weights": weights,
        "warning": (
            "This score uses public metadata and repository hygiene signals. "
            "It does not deeply inspect code correctness, originality, or actual skill."
        ),
    }


def build_report(api, username):
    print(f"\nFetching GitHub profile: {username}")
    profile, _ = api.get(f"/users/{username}")

    print("Fetching public repositories...")
    all_repos = api.get_all_pages(
        f"/users/{username}/repos",
        {"sort": "updated", "direction": "desc", "type": "owner"},
        max_pages=3,
    )
    # Keep most recently updated repositories for detailed analysis.
    selected = all_repos[:MAX_REPOSITORIES_TO_ANALYZE]

    print(f"Found {len(all_repos)} public repositories. Analyzing {len(selected)} most recently updated...")
    analyzed = []
    for index, repo in enumerate(selected, start=1):
        print(f"  [{index}/{len(selected)}] {repo['full_name']}")
        analyzed.append(analyze_repository(api, repo, username))
        time.sleep(0.08)

    language_totals = Counter()
    for repo in analyzed:
        for language, byte_count in repo.get("languages", {}).items():
            language_totals[language] += byte_count

    total_stars = sum(r.get("stars", 0) for r in all_repos)
    total_forks = sum(r.get("forks", 0) for r in all_repos)
    original_repos = [r for r in all_repos if not r.get("fork")]
    fork_repos = [r for r in all_repos if r.get("fork")]

    total_author_commits_sample = sum(
        r["authorCommitCount"] for r in analyzed
        if isinstance(r.get("authorCommitCount"), int)
    )
    commits_repos_counted = sum(
        1 for r in analyzed if isinstance(r.get("authorCommitCount"), int)
    )

    score = score_profile(profile, analyzed, language_totals)

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "GitHub REST API",
        "scope": {
            "visibility": "Public repositories and public profile data accessible to the API token",
            "totalPublicRepositoriesReportedByProfile": profile.get("public_repos", 0),
            "repositoriesReturnedByListing": len(all_repos),
            "repositoriesAnalyzedInDetail": len(analyzed),
            "repositoryAnalysisLimit": MAX_REPOSITORIES_TO_ANALYZE,
            "commitCountMethod": "Author-filtered commits endpoint, per analyzed repository, default branch",
        },
        "profile": {
            "username": profile.get("login"),
            "name": profile.get("name"),
            "profileUrl": profile.get("html_url"),
            "avatarUrl": profile.get("avatar_url"),
            "bio": profile.get("bio"),
            "company": profile.get("company"),
            "location": profile.get("location"),
            "blog": profile.get("blog"),
            "email": profile.get("email"),
            "twitterUsername": profile.get("twitter_username"),
            "publicRepositories": profile.get("public_repos"),
            "followers": profile.get("followers"),
            "following": profile.get("following"),
            "createdAt": profile.get("created_at"),
            "accountAgeDays": days_since(profile.get("created_at")),
            "publicGists": profile.get("public_gists"),
            "hireable": profile.get("hireable"),
        },
        "repositorySummary": {
            "repositoriesReturned": len(all_repos),
            "originalRepositories": len(original_repos),
            "forkedRepositories": len(fork_repos),
            "starsAcrossReturnedRepositories": total_stars,
            "forksAcrossReturnedRepositories": total_forks,
            "repositoriesAnalyzed": len(analyzed),
        },
        "activitySummary": {
            "authorCommitCountAcrossAnalyzedRepositories": total_author_commits_sample,
            "repositoriesWithCommitCount": commits_repos_counted,
            "note": (
                "Commit counts cover only analyzed repositories and their default branches. "
                "They are not an all-time count across every contribution or private repository."
            ),
        },
        "languagesByBytesAcrossAnalyzedRepositories": dict(language_totals.most_common()),
        "repositories": analyzed,
        "evaluation": score,
        "limitations": [
            "Only public data is included unless the supplied token has additional authorized access.",
            "Only the most recently updated repositories are analyzed in detail.",
            "GitHub language byte counts do not measure proficiency.",
            "Stars and followers are popularity signals, not proof of engineering ability.",
            "A README, tests folder, or dependency file is only structural evidence, not proof of quality.",
            "Commit counts can be affected by merge commits, rebases, attribution, and default-branch history.",
            "Private work, college projects hosted elsewhere, and team contributions may be missing.",
            "Do not use this report as the sole basis for hiring, rejection, or candidate ranking.",
        ],
    }
    return report


def print_report(report):
    p = report["profile"]
    s = report["repositorySummary"]
    print("\n" + "=" * 72)
    print("GITHUB CANDIDATE REPORT")
    print("=" * 72)
    print(f"Name:             {p.get('name') or 'Not provided'}")
    print(f"Username:         {p.get('username')}")
    print(f"Profile:          {p.get('profileUrl')}")
    print(f"Bio:              {p.get('bio') or 'Not provided'}")
    print(f"Location:         {p.get('location') or 'Not provided'}")
    print(f"Company:          {p.get('company') or 'Not provided'}")
    print(f"Account age:      {p.get('accountAgeDays')} days")
    print(f"Followers:        {p.get('followers')}")
    print(f"Following:        {p.get('following')}")
    print("\nREPOSITORIES")
    print(f"Public repos:     {s.get('repositoriesReturned')}")
    print(f"Original repos:   {s.get('originalRepositories')}")
    print(f"Forked repos:     {s.get('forkedRepositories')}")
    print(f"Stars:            {s.get('starsAcrossReturnedRepositories')}")
    print(f"Forks received:   {s.get('forksAcrossReturnedRepositories')}")
    print(f"Analyzed in detail: {s.get('repositoriesAnalyzed')}")
    print("\nACTIVITY")
    a = report["activitySummary"]
    print(f"Author commits in analyzed repos: {a['authorCommitCountAcrossAnalyzedRepositories']}")
    print(f"Repositories with commit counts:  {a['repositoriesWithCommitCount']}")
    print("\nLANGUAGES (bytes of code, not skill level)")
    if report["languagesByBytesAcrossAnalyzedRepositories"]:
        for language, size in report["languagesByBytesAcrossAnalyzedRepositories"].items():
            print(f"  {language:<20} {size:,}")
    else:
        print("  No language data available.")
    print("\nTOP ANALYZED REPOSITORIES")
    for repo in sorted(report["repositories"], key=lambda x: (x["stars"], x["updatedAt"] or ""), reverse=True)[:10]:
        print(
            f"  {repo['fullName']} | ⭐ {repo['stars']} | "
            f"{repo['primaryLanguage'] or 'N/A'} | "
            f"README: {'Yes' if repo['readme']['exists'] else 'No'} | "
            f"Tests evidence: {'Yes' if repo['hasTestsEvidence'] else 'No'}"
        )
        if repo.get("description"):
            print(f"    {repo['description'][:140]}")
    evaluation = report["evaluation"]
    print("\nINDICATIVE EVALUATION")
    if evaluation.get("total") is None:
        print(evaluation.get("message"))
    else:
        print(f"Evidence score: {evaluation['total']}/100")
        for key, value in evaluation["breakdown"].items():
            print(f"  {key}: {value}/100")
        print("  NOTE:", evaluation["warning"])
    print("\nA JSON report with detailed repository data will also be saved.")
    print("=" * 72)


def main():
    schema_mode = "--schema" in sys.argv
    args = [arg for arg in sys.argv[1:] if arg != "--schema"]
    supplied = args[0] if args else input("Enter GitHub profile URL: ").strip()
    username = parse_username(supplied)

    token = os.getenv("GITHUB_TOKEN", "").strip()
    if not token and not schema_mode:
        print("\nTip: a GitHub token improves API rate limits. Use a token with only the minimum required permissions.")
        answer = input("Do you want to enter a token? (y/N): ").strip().lower()
        if answer == "y":
            token = getpass("GitHub token (input hidden): ").strip()

    api = GitHubAPI(token or None)
    if schema_mode:
        with redirect_stdout(sys.stderr):
            report = build_report(api, username)
    else:
        report = build_report(api, username)
    if schema_mode:
        evaluation = report["evaluation"]
        print(json.dumps({
            "githubUsername": report["profile"].get("username"),
            "githubUrl": report["profile"].get("profileUrl"),
            "evaluation": {
                **evaluation.get("breakdown", {}),
                "evidenceScore": evaluation.get("total"),
            },
            "analyzedAt": report["generatedAt"],
        }))
        return
    print_report(report)

    filename = f"github_report_{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=2, ensure_ascii=False)
    print(f"\nSaved JSON report: {os.path.abspath(filename)}")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, RuntimeError, KeyboardInterrupt) as error:
        print(f"\nError: {error}", file=sys.stderr)
        sys.exit(1)
