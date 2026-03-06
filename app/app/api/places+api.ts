/**
 * API route for reading and updating the places data in the GitHub repo.
 *
 * GET /api/places - returns the current places JSON
 * PUT /api/places - updates the places JSON in the repo (commits)
 */

const REPO = "brentvatne-agent/commercial-drive-food";
const FILE_PATH = "commercial_drive_food.json";
const BRANCH = "main";

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  return token;
}

async function githubFetch(path: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "commercial-drive-food-audit",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function GET() {
  try {
    const file = await githubFetch(`contents/${FILE_PATH}?ref=${BRANCH}`);
    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const data = JSON.parse(content);
    return Response.json(data);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Get current file SHA (needed for update)
    const file = await githubFetch(`contents/${FILE_PATH}?ref=${BRANCH}`);
    const sha = file.sha;

    // Commit updated data
    const content = Buffer.from(
      JSON.stringify(body, null, 2),
      "utf-8"
    ).toString("base64");

    await githubFetch(`contents/${FILE_PATH}`, {
      method: "PUT",
      body: JSON.stringify({
        message: "Update places data from audit tool",
        content,
        sha,
        branch: BRANCH,
      }),
    });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
