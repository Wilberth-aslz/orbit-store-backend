import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Electronica", slug: "electronica" },
  { name: "Ropa", slug: "ropa" },
  { name: "Hogar", slug: "hogar" },
  { name: "Deportes", slug: "deportes" },
];

// Imagenes de picsum.photos (placeholder estable via seed numerico) para no
// depender de ninguna API externa al momento de poblar la base.
const PRODUCTS: Array<{ name: string; description: string; price: number; stock: number; imageUrl: string; category: string }> = [
  { name: "Audifonos inalambricos ORBIT Pulse", description: "Audifonos bluetooth con cancelacion de ruido activa y 30h de bateria.", price: 899, stock: 25, imageUrl: "https://picsum.photos/seed/orbit-1/600/600", category: "electronica" },
  { name: "Smartwatch ORBIT Fit", description: "Reloj inteligente con monitor de ritmo cardiaco, GPS y resistencia al agua.", price: 1499, stock: 15, imageUrl: "https://picsum.photos/seed/orbit-2/600/600", category: "electronica" },
  { name: "Teclado mecanico ORBIT Type", description: "Teclado mecanico retroiluminado RGB, switches rojos, layout espanol.", price: 1099, stock: 20, imageUrl: "https://picsum.photos/seed/orbit-3/600/600", category: "electronica" },
  { name: "Mouse ergonomico ORBIT Grip", description: "Mouse inalambrico ergonomico de alta precision, 6 botones programables.", price: 549, stock: 40, imageUrl: "https://picsum.photos/seed/orbit-4/600/600", category: "electronica" },
  { name: "Bocina portatil ORBIT Boom", description: "Bocina bluetooth resistente al agua IPX7 con 12h de autonomia.", price: 799, stock: 18, imageUrl: "https://picsum.photos/seed/orbit-5/600/600", category: "electronica" },
  { name: "Chamarra impermeable ORBIT Storm", description: "Chamarra ligera impermeable, ideal para lluvia y viento.", price: 1299, stock: 12, imageUrl: "https://picsum.photos/seed/orbit-6/600/600", category: "ropa" },
  { name: "Playera basica ORBIT Core", description: "Playera de algodon premium, corte regular, varios colores.", price: 299, stock: 60, imageUrl: "https://picsum.photos/seed/orbit-7/600/600", category: "ropa" },
  { name: "Sudadera ORBIT Comfort", description: "Sudadera con capucha, interior afelpado, ideal para clima frio.", price: 699, stock: 30, imageUrl: "https://picsum.photos/seed/orbit-8/600/600", category: "ropa" },
  { name: "Gorra ORBIT Street", description: "Gorra ajustable con bordado ORBIT, estilo urbano.", price: 349, stock: 45, imageUrl: "https://picsum.photos/seed/orbit-9/600/600", category: "ropa" },
  { name: "Lampara de escritorio ORBIT Glow", description: "Lampara LED regulable con puerto USB integrado.", price: 459, stock: 22, imageUrl: "https://picsum.photos/seed/orbit-10/600/600", category: "hogar" },
  { name: "Set de sabanas ORBIT Sleep", description: "Juego de sabanas matrimoniales 400 hilos, tela suave hipoalergenica.", price: 999, stock: 16, imageUrl: "https://picsum.photos/seed/orbit-11/600/600", category: "hogar" },
  { name: "Organizador modular ORBIT Space", description: "Set de 3 organizadores apilables para closet o cocina.", price: 389, stock: 28, imageUrl: "https://picsum.photos/seed/orbit-12/600/600", category: "hogar" },
  { name: "Difusor aromatico ORBIT Calm", description: "Difusor ultrasonico con luz LED de 7 colores, silencioso.", price: 599, stock: 20, imageUrl: "https://picsum.photos/seed/orbit-13/600/600", category: "hogar" },
  { name: "Tapete de yoga ORBIT Flex", description: "Tapete antiderrapante de 6mm, incluye correa de transporte.", price: 449, stock: 35, imageUrl: "https://picsum.photos/seed/orbit-14/600/600", category: "deportes" },
  { name: "Mancuernas ajustables ORBIT Power", description: "Par de mancuernas ajustables de 2 a 10kg cada una.", price: 1899, stock: 10, imageUrl: "https://picsum.photos/seed/orbit-15/600/600", category: "deportes" },
  { name: "Botella termica ORBIT Hydro", description: "Botella de acero inoxidable, mantiene frio/calor hasta 12h, 1L.", price: 329, stock: 50, imageUrl: "https://picsum.photos/seed/orbit-16/600/600", category: "deportes" },
  { name: "Banda de resistencia ORBIT Band Set", description: "Set de 5 bandas de resistencia con diferentes niveles de tension.", price: 279, stock: 40, imageUrl: "https://picsum.photos/seed/orbit-17/600/600", category: "deportes" },
];

async function main() {
  console.log("Sembrando base de datos de ORBIT Store...");

  const categoryMap = new Map<string, number>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`- ${CATEGORIES.length} categorias listas`);

  for (const product of PRODUCTS) {
    const categoryId = categoryMap.get(product.category);
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
      create: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
    });
  }
  console.log(`- ${PRODUCTS.length} productos listos`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@orbit.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const userEmail = process.env.SEED_USER_EMAIL ?? "user@orbit.com";
  const userPassword = process.env.SEED_USER_PASSWORD ?? "User123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin ORBIT",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: "Usuario Demo",
      email: userEmail,
      password: await bcrypt.hash(userPassword, 10),
      role: "USER",
    },
  });

  console.log("- Usuarios admin y demo listos");
  console.log("\nCredenciales de prueba:");
  console.log(`  ADMIN -> ${adminEmail} / ${adminPassword}`);
  console.log(`  USER  -> ${userEmail} / ${userPassword}`);
}

main()
  .catch((err) => {
    console.error("Error al sembrar la base de datos:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
