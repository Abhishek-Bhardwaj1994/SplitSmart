import React from "react";
import {
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import {
  PictureAsPdf,
  HorizontalSplit,
  SwapHoriz,
  Image,
  Edit,
  // CompareArrows,
  Compress,
  LockOpen,
} from "@mui/icons-material";

import Navbar from "../components/Navbar"; // ✅ Import updated grouped navbar

const tools = [
  { title: "Merge PDFs", path: "/merge-pdf", icon: <PictureAsPdf fontSize="large" /> },
  { title: "Split PDF", path: "/split-pdf", icon: <HorizontalSplit fontSize="large" /> },
  { title: "Convert PDF/Word", path: "/convert-pdf", icon: <SwapHoriz fontSize="large" /> },
  { title: "Image to PDF", path: "/heif-jpg-image-to-pdf", icon: <Image fontSize="large" /> },
  { title: "Lock/Unlock PDF", path: "/lock-unlock-pdf", icon: <LockOpen fontSize="large" /> },
  { title: "Compress PDF", path: "/compress-pdf", icon: <Compress fontSize="large" /> },
  { title: "Edit PDF", path: "/edit-pdf", icon: <Edit fontSize="large" /> },
];

const bgColors = [
  "#ffe082", "#b39ddb", "#81d4fa", "#ffab91", "#a5d6a7", "#f8bbd0", "#fff59d"
];

const Home = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3ec78, #af4261)",
      }}
    >
      {/* ✅ Navigation Bar */}
      <Navbar />

      {/* ✅ Hero Section */}
      <Container maxWidth="lg" sx={{ textAlign: "center", paddingY: 5 }}>
        <Paper
          elevation={5}
          sx={{
            background: "rgba(255, 255, 255, 0.9)",
            color: "#000",
            padding: 4,
            borderRadius: 3,
            marginBottom: 4,
          }}
        >
          <Typography variant="h3" fontWeight="bold">
          Every PDF Tool You Need 🎉
          </Typography>
          <Typography variant="h6" sx={{ marginTop: 1 }}>
            Every tool you need to work with PDFs. All in one place. Merge, Split,
            Compress, Convert, Edit, and more — 100% Free.
          </Typography>
        </Paper>

        {/* ✅ PDF Tools Grid */}
        <Grid container spacing={4} justifyContent="center">
          {tools.map((tool, index) => (
            <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ display: "flex", justifyContent: "center" }} // 👈 Centers the tile
          >
            <Card
              sx={{
                width: 220,             // 👈 Fixed width for all tiles
                height: 200,            // 👈 Fixed height for all tiles
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: 4,
                borderRadius: 3,
                backgroundColor: bgColors[index % bgColors.length],
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                {tool.icon}
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginTop: 1 }}
                >
                  {tool.title}
                </Typography>
              </CardContent>
          
              <CardActions sx={{ justifyContent: "center", paddingBottom: 2 }}>
                <Button
                  variant="contained"
                  href={tool.path}
                  sx={{
                    background: "#1e88e5",
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default Home;
