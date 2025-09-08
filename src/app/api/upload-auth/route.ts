import {NextResponse} from "next/server";

import {auth} from "@clerk/nextjs/server";
import {getUploadAuthParams} from "@imagekit/next/server";

import {env} from "@/env";

export async function GET() {
  try {
    // Your application logic to authenticate the user
    // For now, we'll allow all uploads, but you can add authentication logic here

    const {userId} = await auth();
    if (!userId)
      return NextResponse.json({error: "Unauthorized Upload"}, {status: 401});

    const {token, expire, signature} = getUploadAuthParams({
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Upload auth error:", error);
    return NextResponse.json(
      {error: "Failed to generate upload authentication parameters"},
      {status: 500}
    );
  }
}
