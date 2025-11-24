/**
 *
 * @param {string} color Can be: black, blue, green, purple, red, yellow
 * @returns {JSX.Element}
 */

function Bat({ color = "black" }) {
  const imgSrc = `/sprites/bats/${color.toLowerCase()}eyedbat.png`;

  return (
    <>
      <img src={imgSrc} alt="bat" />
    </>
  );
}

export default Bat;
