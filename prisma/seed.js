import {
  Gender,
  Weight,
  Packaging,
  PrismaClient,
  ProductCategory,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@gmail.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        phone: "08123456789",
        gender: Gender.LAKI_LAKI,
        address: "Jl. Melati No. 123",
        is_admin: true,
      },
    });

    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin user already exists");
  }

  const productsCount = await prisma.product.count();
  if (productsCount < 5) {
    await prisma.product.createMany({
      data: [
        {
          name: "Kue Nastar",
          price: 50000,
          stock: 30,
          description: "Kue kering isi selai nanas",
          category: ProductCategory.KUE_KERING,
          packaging: Packaging.TOPLES,
          weight: Weight.GRAM_500,
          image:
            "https://res.cloudinary.com/dtscrzs6m/image/upload/v1752563152/kue_nastar_pvxbhg.jpg",
        },
        {
          name: "Kue Putri Salju",
          price: 25000,
          stock: 30,
          description:
            "Kue bulan sabit yang di atasnya diselimuti dengan gula halus seperti salju",
          category: ProductCategory.KUE_KERING,
          packaging: Packaging.TOPLES,
          weight: Weight.GRAM_250,
          image:
            "https://res.cloudinary.com/dtscrzs6m/image/upload/v1752563153/putri_salju_ff6u4q.jpg",
        },
        {
          name: "Keripik Singkong Original",
          price: 30000,
          stock: 25,
          description: "Keripik singkong gurih dan renyah",
          category: ProductCategory.MAKANAN_RINGAN,
          packaging: Packaging.BAL,
          weight: Weight.KG_2,
          image:
            "https://res.cloudinary.com/dtscrzs6m/image/upload/v1752109691/keripik-og_gaorgv.jpg",
        },
        {
          name: "Keripik Tempe Original",
          price: 15000,
          stock: 25,
          description: "Keripik tempe gurih dan renyah",
          category: ProductCategory.MAKANAN_RINGAN,
          packaging: Packaging.BAL,
          weight: Weight.KG_1,
          image:
            "https://res.cloudinary.com/dtscrzs6m/image/upload/v1752563151/keripik_tempe_wamefc.jpg",
        },
      ],
    });

    console.log("✅ 4 products created");
  } else {
    console.log("ℹ️ Products already exist");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
