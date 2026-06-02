import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth/admin";
import { R2_BUCKET, R2_PUBLIC_URL, r2Client } from "@/lib/r2/client";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE_MB = 20;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!isAdmin(userId)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: `File too large. Maximum size: ${MAX_SIZE_MB}MB` },
      { status: 400 },
    );
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const key = `portfolio/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const url = `${R2_PUBLIC_URL}/${key}`;
    return Response.json({ url, key, fileSize: file.size });
  } catch (err) {
    console.error("R2 upload failed:", err);
    return Response.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
