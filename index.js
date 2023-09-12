const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const resizedPath = "./images/resized/"; // specify the output folder
// const maxSizeInMb = 0.9; // Specify file size in Mb
const sizeInPixels = 800; // type the length of the long edge in pixels

// Helper function to convert bytes to megabytes
const convertToMb = (bytes) => bytes / (1024 * 1024);

// If folder doesn't exist, create it.
if (!fs.existsSync(resizedPath)) {
  fs.mkdirSync(resizedPath);
}

// Check if image size is greater than the specified limit
function isSizeGreaterThanLimit(imagePath, limitInMb) {
  const stats = fs.statSync(imagePath);
  const sizeInMb = convertToMb(stats.size);
  return sizeInMb > limitInMb;
}

// Swap the original file extension with jpeg
const generateFileName = (fileName, sequence) => {
  const newName = fileName.split(".")[0] + "-" + sequence + ".jpeg";
  return newName;
};

// Resize image and save
async function resizeImage(imagePath, fileName, sequence = 1) {
  const metadata = await sharp(imagePath).metadata();
  const longEdge = metadata.width > metadata.height ? "width" : "height";
  const outputPath = path.resolve(resizedPath, generateFileName(fileName, sequence));

  try {
    await sharp(imagePath)
      .resize({
        width: sizeInPixels,
        height: sizeInPixels,
        fit: "contain",
        background: "white",
      })
      .toFormat("jpeg")
      .jpeg({ quality: 90, force: true })
      .toFile(outputPath);

    console.log("Image resized, original: ", fileName);
  } catch (error) {
    console.log(error);
  }
}

async function iteration(folderPath) {
  const filesToProcess = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .filter((fileName) => !fileName.startsWith("."));

  for (const file of filesToProcess) {
    const imagePath = path.resolve(folderPath, file);

    await resizeImage(imagePath, file);
  }
}

iteration("images").catch((error) => {
  console.log(`An error occurred during iteration: ${error}`);
});
