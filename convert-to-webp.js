import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = path.join("client", "public", "themes");
const outputDir = path.join(inputDir, "webp");
const sizes = [
  { name: "mobile", width: 1080, height: 1920 },
  { name: "tablet", width: 1440, height: 2560 }
];

// Créer dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();

  // Ignorer les fichiers qui ne sont pas image ou déjà WebP
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return;
  if (ext === ".webp") return;

  const inputPath = path.join(inputDir, file);
  const baseName = path.basename(file, ext);

  sizes.forEach(size => {
    const sizeDir = path.join(outputDir, size.name);
    if (!fs.existsSync(sizeDir)) fs.mkdirSync(sizeDir);

    const outputPath = path.join(sizeDir, baseName + ".webp");

    sharp(inputPath)
      .resize(size.width, size.height, { fit: "cover" }) // cover = remplit l'écran
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() =>
        console.log(`✅ Converti : ${file} → ${size.name}/${baseName}.webp`)
      )
      .catch(err => console.error(err));
  });
});
