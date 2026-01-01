import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: ".env.local" });

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "aura-raw-data-bucket";

// 업로드할 파일 정보
const mockFiles = [
  {
    localPath: "./public/sample-files/namanmoo.pptx",
    s3Key: "meetings/2024/01/namanmoo.pptx",
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  {
    localPath: "./public/sample-files/IMG_1499.jpg",
    s3Key: "meetings/2024/01/IMG_1499.jpg",
    contentType: "image/jpeg",
  },
];

async function uploadFile(localPath: string, s3Key: string, contentType: string) {
  try {
    // 파일 읽기
    const fileContent = fs.readFileSync(path.resolve(localPath));
    const fileStats = fs.statSync(path.resolve(localPath));

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${s3Key}`;

    console.log(`✅ Uploaded: ${localPath}`);
    console.log(`   URL: ${fileUrl}`);
    console.log(`   Size: ${fileStats.size} bytes\n`);

    return {
      fileId: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: path.basename(localPath),
      fileUrl,
      fileSize: fileStats.size,
      fileType: contentType,
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${localPath}:`, error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting S3 mock file upload...\n");

  const uploadedFiles = [];

  for (const file of mockFiles) {
    const fileInfo = await uploadFile(file.localPath, file.s3Key, file.contentType);
    uploadedFiles.push(fileInfo);
  }

  console.log("\n📝 Mock data for reports.ts:");
  console.log(JSON.stringify(uploadedFiles, null, 2));
}

main().catch(console.error);
