import { NextApiRequest, NextApiResponse } from "next";
import {
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../../../src/lib/barcodeStore";
import { requireAdmin } from "../../../../src/lib/serverAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  return requireAdmin(req, res).then((session) => {
    if (!session) return null;

    if (req.method === "GET") {
      const t = getTemplate(id);
      if (!t) return res.status(404).end("Not found");
      return res.status(200).json(t);
    }

    if (req.method === "PUT") {
      const patched = updateTemplate(id, req.body);
      if (!patched) return res.status(404).end("Not found");
      return res.status(200).json(patched);
    }

    if (req.method === "DELETE") {
      deleteTemplate(id);
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end("Method Not Allowed");
  });
}
