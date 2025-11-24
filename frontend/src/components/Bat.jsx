/**
 *
 * @param {string} color Can be: black, blue, green, purple, red, yellow
 * @returns {JSX.Element}
 */

function Bat({ color = "black" }) {
  color = color.toLowerCase();
  const imgSrc = `/sprites/bats/${color}eyedbat.png`;

  return (
    <>
      <img src={imgSrc} alt="" />
    </>
  );
}

export default Bat;
