const video = document.getElementById("video");
const c = document.getElementById("canvas");
const img = document.getElementById("img");

let stream = null;
let recorder = null;

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 7;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawSkeleton(keypoints, ctx, scale = 1) {
  function toTuple({ y, x }) {
    return [y, x];
  }

  keypoints.forEach((keypoints) => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      "orangered",
      scale,
      ctx
    );
  });
}

const getCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    recorder = new MediaRecorder(stream);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const context = c.getContext("2d");
    c.width = 640;
    c.height = 480;
    canvas.width = 640;
    canvas.height = 480;

    recorder.addEventListener("dataavailable", (evt) => {
      ctx.drawImage(video, 0, 0);
      context.clearRect(0, 0, 640, 480);

      canvas.toBlob((blob) => {
        const dateLabel = new Date().getTime();
        console.time(dateLabel);

        fetch("http://localhost:4000", {
          method: "POST",
          headers: {
            "content-type": "application/octet-stream",
          },
          body: blob,
        })
          .then((res) => res.json())
          .then((res) => {
            console.timeEnd(dateLabel);
            drawSkeleton(res, context);
          });
      });
    });

    recorder.start(200);
  } catch (err) {
    console.error(err);
  }
};

getCamera();
