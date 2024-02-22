// TODO: refactor to be resizable on the x axis
document.addEventListener("DOMContentLoaded", function () {
  const paper = document.getElementById("canvas"),
    pen = paper.getContext("2d");

  const colors = [
    "#D0E7F5",
    "#D9E7F4",
    "#D6E3F4",
    "#BCDFF5",
    "#B7D9F4",
    "#C3D4F0",
    "#9DC1F3",
    "#9AA9F4",
    "#8D83EF",
    "#AE69F0",
    "#D46FF1",
    "#DB5AE7",
    "#D911DA",
    "#D601CB",
    "#E713BF",
    "#F24CAE",
    "#FB79AB",
    "#FFB6C1",
    "#FED2CF",
    "#FDDFD5",
    "#FEDCD1",
  ];

  const settings = {
    startTime: new Date().getTime(),
    duration: 200,
    maxCycles: Math.max(colors.length, 100),
    startX: paper.clientWidth * 0.125,
    endX: paper.clientWidth * 0.875,
    offSet: 0,
    soundEnabled: true,
    pulseEnabled: true,
    instrument: "vibraphone", // "default" | "wave" | "vibraphone"
  };

  document.onvisibilitychange = () => handleSoundToggle(false);

  paper.onclick = () => handleSoundToggle();

  const getFileName = (index) => {
    if (settings.instrument === "default") return `key-${index}`;

    return `${settings.instrument}-key-${index}`;
  };

  const getUrl = (index) =>
    `https://assets.codepen.io/1468070/${getFileName(index)}.wav`;

  const keys = colors.map((color, index) => {
    const audio = new Audio(getUrl(index));

    audio.volume = 0.15;

    return audio;
  });

  const calculateVelocity = (index) => {
    const timesTransversed = settings.maxCycles - index,
      distancePerTransversal = settings.endX - settings.startX;

    return (timesTransversed * distancePerTransversal) / settings.duration;
  };

  // Fine
  const calculateNextImpactTime = (currentImpactTime, velocity) => {
    return (
      currentImpactTime +
      (Math.ceil(settings.endX - settings.startX) / velocity) * 1000
    );
  };

  const playKey = (index) => keys[index].play();
  let lines = [];
  const init = () => {
    lines = colors.map((color, index) => {
      const velocity = calculateVelocity(index),
        lastImpactTime = 0,
        nextImpactTime = calculateNextImpactTime(settings.startTime, velocity);

      return {
        color,
        velocity,
        lastImpactTime,
        nextImpactTime,
      };
    });
  };

  const drawLine = (height, start, end) => {
    pen.lineCap = "round";
    pen.beginPath();
    pen.moveTo(start, height);
    pen.lineTo(end, height);
    pen.stroke();
  };

  const drawPointOnLine = (height, start, end, currentPosition) => {
    pen.lineCap = "round";
    const lineWidth = end - start;
    pen.beginPath();
    pen.arc(
      currentPosition,
      height,
      5, //Radius - static
      0, // Arc start - static
      2 * Math.PI //Arc end - static
    );
    pen.fill();
  };

  const draw = () => {
    paper.width = paper.clientWidth;
    paper.height = paper.clientHeight;
    pen.lineWidth = 5;

    const lineWidth = settings.startX - settings.endX;

    // Time is used to determine where the point should be on the line
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - settings.startTime) / 1000;

    lines.forEach((line, index) => {
      pen.strokeStyle = line.color;
      pen.fillStyle = line.color;

      const height =
        paper.clientHeight * 0.1 +
        ((paper.clientHeight * 0.9 - paper.clientHeight * 0.1) / lines.length) * index;

      drawLine(height, settings.startX, settings.endX);

      // TODO: why ball render on wrong side
      if (currentTime >= line.nextImpactTime) {
        if (settings.soundEnabled) {
          playKey(index);
          line.lastImpactTime = line.nextImpactTime;
        }
        line.nextImpactTime = calculateNextImpactTime(
          line.nextImpactTime,
          line.velocity
        );
        line.reverse = !line.reverse;
      }

      const distance = elapsedTime >= 0 ? elapsedTime * line.velocity : 0;

      if (line.reverse) {
        line.currentPosition = settings.endX - (distance % lineWidth);
      } else {
        line.currentPosition = settings.startX + (distance % lineWidth);
      }

      drawPointOnLine(
        height,
        settings.startX,
        settings.endX,
        line.currentPosition
      );
    });

    requestAnimationFrame(draw);
  };

  init();
  draw();
});
