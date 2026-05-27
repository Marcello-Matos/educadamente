import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  ...(isGithubActions && {
    output: "export",
    basePath: `/${repoName}`,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
