import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          PDF Tools
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button> {/* ✅ Added Home Button */}
        <Button color="inherit" component={Link} to="/merge">Merge PDF</Button>
        <Button color="inherit" component={Link} to="/split">Split PDF</Button>
        <Button color="inherit" component={Link} to="/convert">Convert PDF</Button>
        <Button color="inherit" component={Link} to="/image-to-pdf">Image to PDF</Button>
        <Button color="inherit" component={Link} to="/pdf-to-image">PDF to Image</Button>
        <Button color="inherit" component={Link} to="/login">Login</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
