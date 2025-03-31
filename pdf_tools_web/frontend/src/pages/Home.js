import React from "react";
import { AppBar, Toolbar, Typography, Button, Container, Grid, Paper, Card, CardContent, CardActions } from "@mui/material";
import { PictureAsPdf, HorizontalSplit, SwapHoriz, Image } from "@mui/icons-material";
import MergePDF from "../components/MergePDF";
import SplitPDF from "../components/SplitPDF";
import ConvertPDF from "../components/ConvertPDF";
import ImageToPDF from "../components/ImageToPDF";
import PDFToImage from "../components/PDFToImage";

const tools = [
  { title: "Merge PDFs", path: "/merge-pdf", icon: <PictureAsPdf fontSize="large" /> },
  { title: "Split PDF", path: "/split-pdf", icon: <HorizontalSplit fontSize="large" /> },
  { title: "Convert PDF", path: "/convert-pdf", icon: <SwapHoriz fontSize="large" /> },
  { title: "Image to PDF", path: "/heif-jpg-image-to-pdf", icon: <Image fontSize="large" /> },
  { title: "PDF to Image", path: "/pdf-to-heif-jpg-image", icon: <PictureAsPdf fontSize="large" /> },
];

const Home = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "url('/background.jpg') no-repeat center center/cover",
      }}
    >
      {/* ✅ Navigation Bar */}
      <AppBar position="static" sx={{ background: "#1976d2" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            PDF Tools
          </Typography>
          {tools.map((tool, index) => (
            <Button key={index} color="inherit" href={tool.path}>
              {tool.title}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

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
            Welcome to PDF Tools
          </Typography>
          <Typography variant="h6" sx={{ marginTop: 1 }}>
            The ultimate tool for all your PDF needs. Merge, Split, Convert & Edit PDFs with ease.
          </Typography>
        </Paper>

        {/* ✅ PDF Tools Grid */}
        <Grid container spacing={4} justifyContent="center">
          {tools.map((tool, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  {tool.icon}
                  <Typography variant="h6" fontWeight="bold" sx={{ marginTop: 1 }}>
                    {tool.title}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", paddingBottom: 2 }}>
                  <Button variant="contained" href={tool.path} sx={{ background: "#1976d2" }}>
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
