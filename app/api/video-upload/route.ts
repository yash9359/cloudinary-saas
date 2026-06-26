import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/PrismaSetup/prismaSetup";




interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    eager?: Array<{
        bytes?: number;
        secure_url?: string;
        url?: string;
    }>;
    [key: string]: unknown;
}

export async function POST(request: NextRequest) {

    try {

        const user = await auth();
        const { userId } = user;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json({ error: "Cloudinary credentials not found" }, { status: 500 })
        }



        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;




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
                        resource_type: "video",
                        folder: "saas-video-upload",
                        eager: [
                            {
                                quality: "auto:low",
                                fetch_format: "mp4",
                                video_codec: "auto"
                            }
                        ],
                        eager_async: false
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    },
                );
                uploadStream.end(buffer);
            },
        );

        const compressedSize = result.eager?.[0]?.bytes ?? result.bytes;

        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(compressedSize),
                duration: result.duration|| 0
            }
        })

        return NextResponse.json(
            {
            video
        },{status:200}
        )
            

    } catch (error) {
        console.log("Upload video failed : ", error);

        return NextResponse.json({ error: "Upload video failed" }, { status: 500 });
    }
}
