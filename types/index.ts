export interface Video {
    id: string
    title: string
    description: string
    publicId: string
    originalSize: number | string
    compressedSize: number | string
    duration: number
    createdAt: Date
    updatedAt: Date
}
