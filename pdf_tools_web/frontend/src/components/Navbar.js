import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const groupedTools = [
  {
    label: "Organize PDF",
    tools: [
      { name: "Merge PDF", path: "/merge-pdf" },
      { name: "Split PDF", path: "/split-pdf" },
    ],
  },
  {
    label: "Convert PDF",
    tools: [
      { name: "PDF ↔ Word", path: "/convert-pdf" },
      { name: "Image to PDF", path: "/heif-jpg-image-to-pdf" },
      // { name: "PDF to Image", path: "/pdf-to-image" },
    ],
  },
  {
    label: "Edit & Security",
    tools: [
      { name: "Lock/Unlock PDF", path: "/lock-unlock-pdf" },
      { name: "Compress PDF", path: "/compress-pdf" },
      { name: "Edit PDF", path: "/edit-pdf" },
    ],
  },
];

const Navbar = () => {
  const [anchorEls, setAnchorEls] = React.useState({});

  const handleClick = (label, event) => {
    setAnchorEls((prev) => ({ ...prev, [label]: event.currentTarget }));
  };

  const handleClose = (label) => {
    setAnchorEls((prev) => ({ ...prev, [label]: null }));
  };

  return (
    <AppBar position="static" sx={{ background: "#333" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          📄 PDF Tools
        </Typography>

        <Button color="inherit" component={Link} to="/">
          Home
        </Button>

        {groupedTools.map((group) => (
          <Box key={group.label}>
            <Button
              color="inherit"
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => handleClick(group.label, e)}
            >
              {group.label}
            </Button>
            <Menu
              anchorEl={anchorEls[group.label]}
              open={Boolean(anchorEls[group.label])}
              onClose={() => handleClose(group.label)}
            >
              {group.tools.map((tool) => (
                <MenuItem
                  key={tool.name}
                  component={Link}
                  to={tool.path}
                  onClick={() => handleClose(group.label)}
                >
                  {tool.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ))}

        <Button color="inherit" component={Link} to="/login">
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
