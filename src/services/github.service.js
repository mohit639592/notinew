const axios = require("axios");

const username = process.env.GITHUB_USERNAME;

async function fetchGitHubStats() {
  const res = await axios.get(
    `https://api.github.com/users/${username}`
  );

  const data = res.data;

  return {
    repos: data.public_repos ?? 0,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    avatar: data.avatar_url ?? "",
    profileUrl: data.html_url ?? "",
    githubSince: data.created_at ?? ""
  };
}

module.exports = fetchGitHubStats;
