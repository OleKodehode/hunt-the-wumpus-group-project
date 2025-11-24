function Player({ dir = "left" }) {
  const imgSrc = "/sprites/player/player.png";
  const imgDir = { transform: `scaleX(${dir === "right" ? -1 : 1})` };
  return (
    <>
      <img src={imgSrc} alt="player" style={imgDir} />
    </>
  );
}

export default Player;
