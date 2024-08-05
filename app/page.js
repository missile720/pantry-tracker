"use client";

import {
  Box,
  Typography,
  Button
} from "@mui/material";

export default function Home() {

  function authorizationPage(){
    
  }

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignContent="center"
      bgcolor="#F5F5DC"
    >
      <Box
        position="absolute"
        top="35%"
        left="50%"
        width="max(50vw, 330px)"
        sx={{
          transform: "translate(-50%,-50%)",
        }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        flexWrap="wrap"
      >
        <Typography variant="h1" textAlign="center" fontSize="max(8vw, 56px)">Smart Pantry</Typography>
        <Typography variant="h4" textAlign="center" fontSize="max(2vw, 14px)">Smart Solutions for Your Pantry Needs</Typography>
      </Box>
      <Box 
        position="absolute"
        top="55%"
        left="50%"
        sx={{
          transform: "translate(-50%,-50%)",
        }}
      >
      <Button 
        variant="contained" 
        sx={{
          bgcolor: "#4CAF50",
          color: "#000000",
          fontWeight: "600",
          "&:hover": {
            bgcolor: "#FF9800",
          }
        }}
        onClick={() => authorizationPage()}
      >Enter</Button>
      </Box>
    </Box>
  );
}
