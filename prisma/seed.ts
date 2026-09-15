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

// Fotos reales de cada producto (Wikimedia Commons, licencia libre), elegidas
// para que coincidan con lo que describe el nombre -- no son placeholders
// genericos aleatorios.
const PRODUCTS: Array<{ name: string; description: string; price: number; stock: number; imageUrl: string; category: string }> = [
  { name: "Audifonos inalambricos ORBIT Pulse", description: "Audifonos bluetooth con cancelacion de ruido activa y 30h de bateria.", price: 899, stock: 25, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Headphones_on_desk.jpg/960px-Headphones_on_desk.jpg", category: "electronica" },
  { name: "Smartwatch ORBIT Fit", description: "Reloj inteligente con monitor de ritmo cardiaco, GPS y resistencia al agua.", price: 1499, stock: 15, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Smartwatch-828786.jpg/960px-Smartwatch-828786.jpg", category: "electronica" },
  { name: "Teclado mecanico ORBIT Type", description: "Teclado mecanico retroiluminado RGB, switches rojos, layout espanol.", price: 1099, stock: 20, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg", category: "electronica" },
  { name: "Mouse ergonomico ORBIT Grip", description: "Mouse inalambrico ergonomico de alta precision, 6 botones programables.", price: 549, stock: 40, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/A_wireless_computer_mouse.jpg/960px-A_wireless_computer_mouse.jpg", category: "electronica" },
  { name: "Bocina portatil ORBIT Boom", description: "Bocina bluetooth resistente al agua IPX7 con 12h de autonomia.", price: 799, stock: 18, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/UE_Boom_speakers.jpg", category: "electronica" },
  { name: "Chamarra impermeable ORBIT Storm", description: "Chamarra ligera impermeable, ideal para lluvia y viento.", price: 1299, stock: 12, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Raincoat_for_Cyclists_%281649092784%29.jpg/960px-Raincoat_for_Cyclists_%281649092784%29.jpg", category: "ropa" },
  { name: "Playera basica ORBIT Core", description: "Playera de algodon premium, corte regular, varios colores.", price: 299, stock: 60, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Crew_neck_T-shirt.jpg", category: "ropa" },
  { name: "Sudadera ORBIT Comfort", description: "Sudadera con capucha, interior afelpado, ideal para clima frio.", price: 699, stock: 30, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/WP_hoodie_FRONTcBack_Merchandise_shots-36.jpg/960px-WP_hoodie_FRONTcBack_Merchandise_shots-36.jpg", category: "ropa" },
  { name: "Gorra ORBIT Street", description: "Gorra ajustable con bordado ORBIT, estilo urbano.", price: 349, stock: 45, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Baseball_cap.jpg", category: "ropa" },
  { name: "Lampara de escritorio ORBIT Glow", description: "Lampara LED regulable con puerto USB integrado.", price: 459, stock: 22, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Battery_powered_LED_desk_lamp-7420.jpg/960px-Battery_powered_LED_desk_lamp-7420.jpg", category: "hogar" },
  { name: "Set de sabanas ORBIT Sleep", description: "Juego de sabanas matrimoniales 400 hilos, tela suave hipoalergenica.", price: 999, stock: 16, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Prze%C5%9Bcierad%C5%82o.jpg/960px-Prze%C5%9Bcierad%C5%82o.jpg", category: "hogar" },
  { name: "Organizador modular ORBIT Space", description: "Set de 3 organizadores apilables para closet o cocina.", price: 389, stock: 28, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Woman_organizes_storage_bins_in_a_large_retail_store_while_shopping.jpg/960px-Woman_organizes_storage_bins_in_a_large_retail_store_while_shopping.jpg", category: "hogar" },
  { name: "Difusor aromatico ORBIT Calm", description: "Difusor ultrasonico con luz LED de 7 colores, silencioso.", price: 599, stock: 20, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Duftlampen.jpg/960px-Duftlampen.jpg", category: "hogar" },
  { name: "Tapete de yoga ORBIT Flex", description: "Tapete antiderrapante de 6mm, incluye correa de transporte.", price: 449, stock: 35, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Yoga_mat.jpg/960px-Yoga_mat.jpg", category: "deportes" },
  { name: "Mancuernas ajustables ORBIT Power", description: "Par de mancuernas ajustables de 2 a 10kg cada una.", price: 1899, stock: 10, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/TwoDumbbells.JPG", category: "deportes" },
  { name: "Botella termica ORBIT Hydro", description: "Botella de acero inoxidable, mantiene frio/calor hasta 12h, 1L.", price: 329, stock: 50, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Niksun_stainless_steel_water_bottle.jpg/960px-Niksun_stainless_steel_water_bottle.jpg", category: "deportes" },
  { name: "Banda de resistencia ORBIT Band Set", description: "Set de 5 bandas de resistencia con diferentes niveles de tension.", price: 279, stock: 40, imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Attractive_young_woman_have_exercise_with_tape_in_the_gym.jpg/960px-Attractive_young_woman_have_exercise_with_tape_in_the_gym.jpg", category: "deportes" },
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
