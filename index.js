const tf = require("@tensorflow/tfjs-node");
const posenet = require("@tensorflow-models/posenet");
let net = null;

const fs = require("fs");
const express = require("express");
const app = express();

const { Image, createCanvas } = require("canvas");

app.use(express.static("public"));
app.use(express.raw({ limit: "50mb" }));

app.post("/", async (req, res) => {
  const canvas = createCanvas(640, 480);
  const ctx = canvas.getContext("2d");
  try {
    const img = new Image();
    img.src = req.body;
    ctx.drawImage(img, 0, 0);
    const input = tf.browser.fromPixels(canvas);
    const { keypoints } = await net.estimateSinglePose(input, 0.5, true, 16);

    return res.json(posenet.getAdjacentKeyPoints(keypoints, 0.5));
  } catch (err) {
    console.error(err);
  }
});

app.listen(4000, async () => {
  net = await posenet.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: { width: 640, height: 480 },
    multiplier: 0.75,
  });

  console.log("Server running");
});
