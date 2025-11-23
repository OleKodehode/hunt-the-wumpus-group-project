import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";

function ErrorPage() {
  const buttonStyle = {
    maxWidth: "20dvw",
    textTransform: "none",
    fontFamily: "var(--font-button)",
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#FFD700",
    backgroundColor: "#7B1E1E",
    border: "3px solid #FFD700",
    borderRadius: "15px",
    padding: "12px 24px",
    boxShadow: "4px 4px 0 #000",

    "&:hover": {
      backgroundColor: "#531111ff",
      boxShadow: "2px 2px 0 #000",
      transform: "translateY(-2px)",
    },

    "&:active": {
      boxShadow: "inset 2px 2px 0 #000",
      transform: "translateY(2px)",
    },
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    gap: 24,
    ml: 5,
  };
  return (
    <>
      <div className="bg-[url('errorPage.jpg')] bg-cover bg-center h-[100dvh]">
        <Container maxWidth="md" sx={containerStyle}>
          <h1 className="errorFont text-6xl text-[var(--color-title)]">
            Lost? Let’s find your path again.
          </h1>
          <Link href="/">
            <Button size="large" variant="contained" sx={buttonStyle}>
              Find Your Way
            </Button>
          </Link>
        </Container>
      </div>
    </>
  );
}

export default ErrorPage;
