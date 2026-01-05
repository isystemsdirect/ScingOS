import type { NextApiRequest, NextApiResponse } from "next";
import { CREATOR_STAMP } from "../../../lib/shared/provenance/creatorStamp";
import { hashCreatorStamp } from "../../../lib/server/provenance/hashStamp";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    ok: true,
    creator: CREATOR_STAMP,
    sha256: hashCreatorStamp(),
  });
}
