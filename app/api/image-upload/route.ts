import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";

interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    const user = await auth();
    const { userId } = user;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 });
        }

        /* file se buffer banyenge aary buffer kyuki next js mai multer jesa system nahi hota serverside upload ke liye cloydinary direct binary data  nahi le pata to buffer ke through milta binary data*/

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "cloudinary-saas",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    },
                );
                uploadStream.end(buffer);
            },
        );

        return NextResponse.json(
            {
                publicId: result.public_id,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.log("Upload Image failed : ", error);

        return NextResponse.json({ error: "Upload image failed" }, { status: 500 }
        );
    }
}
