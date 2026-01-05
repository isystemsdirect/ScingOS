import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA || null;
  const branch = process.env.NEXT_PUBLIC_BUILD_BRANCH || null;
  const time = process.env.NEXT_PUBLIC_BUILD_TIME || null;

  return res.status(200).json({
    ok: true,
    build: {
      sha,
      branch,
      time,
    },
  });
}
