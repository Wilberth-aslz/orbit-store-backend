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

// Fotos reales de cada producto, todas de la misma fuente de catalogo de
// e-commerce (cdn.dummyjson.com) que usa la seccion "Tendencias" (FakeStore
// API) -- mismo estilo de estudio, fondo blanco, HD. Donde el nombre
// original (ej. "Teclado mecanico") no tenia una foto real disponible en esa
// fuente, se cambio el producto por otro del mismo tipo de tienda que si la
// tiene, en vez de forzar una foto que no correspondiera.
const PRODUCTS: Array<{ name: string; description: string; price: number; stock: number; imageUrl: string; category: string }> = [
  { name: "Audifonos inalambricos ORBIT Pulse", description: "Audifonos bluetooth con cancelacion de ruido activa y 30h de bateria.", price: 899, stock: 25, imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp", category: "electronica" },
  { name: "Smartwatch ORBIT Fit", description: "Reloj inteligente con monitor de ritmo cardiaco, GPS y resistencia al agua.", price: 1499, stock: 15, imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp", category: "electronica" },
  { name: "Laptop ORBIT Power", description: "Laptop ultradelgada, pantalla dual, ideal para trabajo y creatividad.", price: 24999, stock: 8, imageUrl: "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/1.webp", category: "electronica" },
  { name: "Cargador portatil ORBIT Charge", description: "Power bank inalambrico magnetico, carga rapida, compatible con la mayoria de celulares.", price: 649, stock: 40, imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp", category: "electronica" },
  { name: "Bocina portatil ORBIT Boom", description: "Bocina inteligente con excelente calidad de sonido, control por voz.", price: 799, stock: 18, imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/1.webp", category: "electronica" },
  { name: "Camisa a cuadros ORBIT Flannel", description: "Camisa de manga larga a cuadros, algodon suave, corte regular.", price: 549, stock: 30, imageUrl: "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp", category: "ropa" },
  { name: "Playera basica ORBIT Core", description: "Playera de algodon premium, manga corta, corte regular.", price: 299, stock: 60, imageUrl: "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp", category: "ropa" },
  { name: "Camisa casual ORBIT Weekend", description: "Camisa a cuadros de manga larga, ideal para uso diario o casual.", price: 599, stock: 25, imageUrl: "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/1.webp", category: "ropa" },
  { name: "Vestido casual ORBIT Grace", description: "Vestido casual de corte sencillo, comodo para el dia a dia.", price: 749, stock: 20, imageUrl: "https://cdn.dummyjson.com/product-images/tops/gray-dress/1.webp", category: "ropa" },
  { name: "Lampara de escritorio ORBIT Glow", description: "Lampara de mesa decorativa, pantalla de tela y base con acabado artesanal.", price: 459, stock: 22, imageUrl: "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp", category: "hogar" },
  { name: "Mesa de noche ORBIT Rest", description: "Mesa auxiliar de madera con cajon y repisa, acabado cerezo.", price: 2199, stock: 10, imageUrl: "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/1.webp", category: "hogar" },
  { name: "Organizador modular ORBIT Space", description: "Organizador colgante de metal para tazas o accesorios de cocina.", price: 389, stock: 28, imageUrl: "https://cdn.dummyjson.com/product-images/kitchen-accessories/mug-tree-stand/1.webp", category: "hogar" },
  { name: "Planta decorativa ORBIT Green", description: "Planta artificial en maceta, decoracion de interiores sin mantenimiento.", price: 499, stock: 20, imageUrl: "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/1.webp", category: "hogar" },
  { name: "Raqueta de tenis ORBIT Ace", description: "Raqueta de tenis ligera, marco de grafito, para jugadores intermedios.", price: 1299, stock: 15, imageUrl: "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-racket/1.webp", category: "deportes" },
  { name: "Balon de basquetbol ORBIT Court", description: "Balon de basquetbol oficial, superficie de agarre para interior y exterior.", price: 599, stock: 35, imageUrl: "https://cdn.dummyjson.com/product-images/sports-accessories/basketball/1.webp", category: "deportes" },
  { name: "Balon de futbol ORBIT Kick", description: "Balon de futbol talla 5, costura resistente, para cancha y pasto sintetico.", price: 549, stock: 40, imageUrl: "https://cdn.dummyjson.com/product-images/sports-accessories/football/1.webp", category: "deportes" },
  { name: "Guante de beisbol ORBIT Catch", description: "Guante de beisbol de piel, ajuste comodo, para practica y juego.", price: 899, stock: 18, imageUrl: "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/1.webp", category: "deportes" },
];

// Productos con nombres antiguos que ya no existen en el catalogo (se
// renombraron/reemplazaron al cambiar todas las fotos a la misma fuente).
// Se eliminan del todo en vez de dejarlos huerfanos en la base.
const RETIRED_PRODUCT_NAMES = [
  "Teclado mecanico ORBIT Type",
  "Mouse ergonomico ORBIT Grip",
  "Chamarra impermeable ORBIT Storm",
  "Sudadera ORBIT Comfort",
  "Gorra ORBIT Street",
  "Set de sabanas ORBIT Sleep",
  "Difusor aromatico ORBIT Calm",
  "Tapete de yoga ORBIT Flex",
  "Mancuernas ajustables ORBIT Power",
  "Botella termica ORBIT Hydro",
  "Banda de resistencia ORBIT Band Set",
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

  const retired = await prisma.product.deleteMany({ where: { name: { in: RETIRED_PRODUCT_NAMES } } });
  if (retired.count > 0) {
    console.log(`- ${retired.count} producto(s) con nombre antiguo eliminados`);
  }

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
