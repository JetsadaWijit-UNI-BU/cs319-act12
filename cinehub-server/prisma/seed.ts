/**
 * ============================================================================
 * ไฟล์: prisma/seed.ts
 * คำอธิบาย: สคริปต์สำหรับจำลองข้อมูลเริ่มต้น (Mock Data / Seed Data) ลงฐานข้อมูล
 * สำหรับผู้เริ่มต้น:
 * - Seeding มีประโยชน์มากในการพัฒนา เพราะช่วยให้เรามีข้อมูลเริ่มต้นพร้อมทดสอบทันที
 * - การลบและสร้างข้อมูลต้องทำตามลำดับความสัมพันธ์ Foreign Key:
 *   ลบตารางลูกก่อนตารางแม่ และสร้างตารางแม่ก่อนตารางลูก
 * ============================================================================
 */

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// เชื่อมต่อ PostgreSQL เข้ากับ Prisma Client สำหรับการ Seed
const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎬 Starting CineHub database seed with 5 movies...");

  // -------------------------------------------------------------
  // ขั้นตอนที่ 1: ล้างข้อมูลเก่าในตารางทิ้งทั้งหมด (Clean slate)
  // **ข้อควรระวังสำหรับผู้เริ่มต้น**: 
  // ต้องลบจาก "ตารางลูก" (Child Table ที่มี Foreign Key อ้างอิงคนอื่น) 
  // ไปหา "ตารางแม่" (Parent Table) เสมอ เพื่อไม่ให้ติด Database Foreign Key Constraint
  // -------------------------------------------------------------
  console.log("🧹 Clearing old records...");
  await prisma.movieReview.deleteMany(); // ตารางลูก: ผูกกับ User และ Movie
  await prisma.watchlist.deleteMany();   // ตารางลูก: ผูกกับ User และ Movie
  await prisma.movie.deleteMany();       // ตารางแม่: ข้อมูลภาพยนตร์
  await prisma.user.deleteMany();        // ตารางแม่: ข้อมูลผู้ใช้

  // -------------------------------------------------------------
  // ขั้นตอนที่ 2: สร้างข้อมูลผู้ใช้ตัวอย่าง (User Records)
  // -------------------------------------------------------------
  console.log("👤 Creating sample users...");
  const memberUser = await prisma.user.create({
    data: {
      email: "somchai@cinehub.com",
      name: "Somchai MovieLover",
      tel: "081-234-5678",        // ฟิลด์เบอร์โทรศัพท์ (รองรับสตริง)
      role: Role.USER,            // กำหนดสิทธิ์เป็น USER ธรรมดา
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "critic@cinehub.com",
      name: "Suda FilmCritic",
      tel: "089-876-5432",
      role: Role.ADMIN,           // กำหนดสิทธิ์เป็น ADMIN
    },
  });

  // -------------------------------------------------------------
  // ขั้นตอนที่ 3: สร้าง Movies 5 เรื่อง
  // -------------------------------------------------------------
  console.log("🎞️ Creating 5 sample movies...");
  const moviesData = [
    {
      title: 'Inception',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi',
      releaseYear: 2010,
      durationMin: 148,
      synopsis: 'ดอม คอบบ์ หัวขโมยมืออาชีพผู้เชี่ยวชาญการดึงข้อมูลจากจิตใต้สำนึกในระหว่างที่เป้าหมายกำลังฝัน',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
    },
    {
      title: 'Interstellar',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi',
      releaseYear: 2014,
      durationMin: 169,
      synopsis: 'ทีมนักสำรวจอวกาศเดินทางผ่านรูหนอนเพื่อค้นหาดาวเคราะห์ดวงใหม่สำหรับมนุษยชาติ',
      posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500',
    },
    {
      title: 'The Dark Knight',
      director: 'Christopher Nolan',
      genre: 'Action',
      releaseYear: 2008,
      durationMin: 152,
      synopsis: 'แบทแมนต้องเผชิญหน้ากับโจ๊กเกอร์ อาชญากรอัจฉริยะที่ต้องการปั่นหัวเมืองก็อตแธมให้ตกอยู่ในความโกลาหล',
      posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500',
    },
    {
      title: 'Spirited Away',
      director: 'Hayao Miyazaki',
      genre: 'Animation',
      releaseYear: 2001,
      durationMin: 125,
      synopsis: 'จิฮิโระ เด็กสาววัย 10 ขวบที่หลงเข้าไปในโลกแห่งวิญญาณและต้องหาทางช่วยพ่อแม่ที่ถูกสาปเป็นหมู',
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
    },
    {
      title: 'Parasite',
      director: 'Bong Joon-ho',
      genre: 'Drama',
      releaseYear: 2019,
      durationMin: 132,
      synopsis: 'เรื่องราวเสียดสีสังคมเมื่อครอบครัวฐานะยากจนค่อยๆ แทรกซึมเข้าไปทำงานในบ้านของครอบครัวเศรษฐี',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
    },
  ];

  const createdMovies = [];
  for (const m of moviesData) {
    const created = await prisma.movie.create({ data: m });
    createdMovies.push(created);
  }

  // -------------------------------------------------------------
  // ขั้นตอนที่ 4: สร้าง Watchlists 3 รายการ
  // -------------------------------------------------------------
  console.log("📌 Creating 3 watchlists...");
  await prisma.watchlist.createMany({
    data: [
      { userId: memberUser.id, movieId: createdMovies[0].id },
      { userId: memberUser.id, movieId: createdMovies[1].id },
      { userId: adminUser.id, movieId: createdMovies[3].id },
    ],
  });

  // -------------------------------------------------------------
  // ขั้นตอนที่ 5: สร้าง MovieReviews 4 รายการ
  // -------------------------------------------------------------
  console.log("⭐ Creating 4 movie reviews...");
  await prisma.movieReview.createMany({
    data: [
      {
        userId: memberUser.id,
        movieId: createdMovies[0].id,
        rating: 10,
        comment: 'ฉากเมืองพับได้และแนวคิดฝันซ้อนฝันสุดยอดมากครับ เป็นหนังขึ้นหิ้งจริงๆ',
      },
      {
        userId: adminUser.id,
        movieId: createdMovies[0].id,
        rating: 9,
        comment: 'ดนตรีประกอบของ Hans Zimmer ทำให้ลุ้นระทึกทุกวินาที',
      },
      {
        userId: memberUser.id,
        movieId: createdMovies[1].id,
        rating: 10,
        comment: 'อธิบายทฤษฎีสัมพัทธภาพและหลุมดำออกมาเป็นภาพที่สวยงามและซึ้งกินใจมาก',
      },
      {
        userId: memberUser.id,
        movieId: createdMovies[4].id,
        rating: 9,
        comment: 'บทภาพยนตร์หักมุมและสะท้อนความเหลื่อมล้ำได้เฉียบคมสุดๆ',
      },
    ],
  });

  console.log("✅ Seed completed successfully! Added 5 movies with reviews and watchlists.");
}

// เรียกให้ฟังก์ชัน main ทำงาน และดักจับ Error ที่อาจเกิดขึ้น
main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    // ปิด Connection ของ Prisma Client เมื่อทำงานเสร็จสิ้น
    await prisma.$disconnect();
  });
