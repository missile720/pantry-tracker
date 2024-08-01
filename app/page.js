'use client'
import Image from "next/image";
import {useState, useEffect} from 'react';
import {firestore} from '@/firebase';
import { Box, Typography } from "@mui/material";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState([]);

  
  return (
    <Box>
      <Typography variant="h1">Pantry Tracker</Typography>
    </Box>
  )
}
