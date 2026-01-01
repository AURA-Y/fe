import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

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

// S3 버킷의 모든 파일 목록 조회
async function listFiles() {
  console.log("📂 S3 버킷 파일 목록 조회 중...\n");

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "meetings/", // meetings/ 폴더만 조회
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log("❌ 파일이 없습니다.");
      return [];
    }

    console.log(`✅ 총 ${response.Contents.length}개 파일 발견:\n`);

    response.Contents.forEach((file) => {
      const sizeInMB = ((file.Size || 0) / 1024 / 1024).toFixed(2);
      console.log(`  📄 ${file.Key}`);
      console.log(`     크기: ${sizeInMB} MB`);
      console.log(`     수정일: ${file.LastModified}\n`);
    });

    return response.Contents;
  } catch (error) {
    console.error("❌ 파일 목록 조회 실패:", error);
    throw error;
  }
}

// 특정 파일 다운로드
async function downloadFile(s3Key: string, localPath: string) {
  console.log(`⬇️  다운로드 중: ${s3Key}`);

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("파일 내용이 없습니다.");
    }

    // Body를 Buffer로 변환
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 로컬에 저장
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(localPath, buffer);

    console.log(`✅ 다운로드 완료: ${localPath}`);
    console.log(`   크기: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n`);
  } catch (error) {
    console.error(`❌ 다운로드 실패 (${s3Key}):`, error);
    throw error;
  }
}

// 파일 메타데이터 조회
async function getFileMetadata(s3Key: string) {
  console.log(`ℹ️  파일 정보 조회: ${s3Key}`);

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);

    console.log(`✅ 파일 정보:`);
    console.log(`   Content-Type: ${response.ContentType}`);
    console.log(`   Content-Length: ${response.ContentLength} bytes`);
    console.log(`   Last-Modified: ${response.LastModified}`);
    console.log(`   ETag: ${response.ETag}\n`);

    return response;
  } catch (error) {
    console.error(`❌ 메타데이터 조회 실패 (${s3Key}):`, error);
    throw error;
  }
}

// 메인 함수
async function main() {
  console.log("🚀 S3 파일 조회 시작...\n");
  console.log(`버킷: ${BUCKET_NAME}\n`);
  console.log("=" .repeat(60) + "\n");

  // 1. 파일 목록 조회
  const files = await listFiles();

  if (files.length === 0) {
    return;
  }

  console.log("=" .repeat(60) + "\n");

  // 2. 첫 번째 파일 메타데이터 조회
  if (files[0].Key) {
    await getFileMetadata(files[0].Key);
  }

  console.log("=" .repeat(60) + "\n");

  // 3. 파일 다운로드 (선택사항)
  const downloadChoice = process.argv[2]; // --download 옵션

  if (downloadChoice === "--download" && files.length > 0) {
    console.log("📥 파일 다운로드 시작...\n");

    for (const file of files) {
      if (file.Key) {
        const fileName = path.basename(file.Key);
        const localPath = `./downloads/${fileName}`;
        await downloadFile(file.Key, localPath);
      }
    }

    console.log("✅ 모든 파일 다운로드 완료!");
  } else {
    console.log("💡 파일을 다운로드하려면 다음 명령어를 실행하세요:");
    console.log("   npx ts-node src/scripts/fetch-s3-files.ts --download\n");
  }
}

main().catch(console.error);
