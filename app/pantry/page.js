"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { auth, firestore } from "@/firebase";
import { signOut } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import {
  collection,
  getDocs,
  getDoc,
  query,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filterInventory, setFilterInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openRecipe, setOpenRecipe] = useState(false);
  const [search, setSearch] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchName, setSearchName] = useState("");
  const { currentUser, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [recipes, setRecipes] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !currentUser) {
      // If user is not logged in, redirect to the login page
      router.push("/authorization");
    } else if (currentUser) {
      // Fetch user-specific data from Firestore
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such document!");
        }
      };
      fetchUserData();
    }
  }, [currentUser, loading, router]);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error.code, error.message);
    }
  };

  const updateInventory = async () => {
    if (!currentUser) return;
    const userPantryRef = collection(
      firestore,
      "users",
      currentUser.uid,
      "pantry"
    );
    const snapshot = query(userPantryRef);
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });

    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    if (searchName.length > 0) {
      searchItem(searchName);
    }
  }, [inventory, searchName]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!currentUser) {
    return <div>Redirecting...</div>;
  }

  const removeItem = async (item) => {
    if (!currentUser) return;

    const userPantryRef = collection(
      firestore,
      "users",
      currentUser.uid,
      "pantry"
    );
    const docRef = doc(userPantryRef, item.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        // If the quantity is 1, delete the document
        await deleteDoc(docRef);
      } else {
        // Otherwise, decrease the quantity by 1
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }

    await updateInventory();
  };

  const addItem = async (item) => {
    if (!currentUser) return;

    const userInventoryRef = collection(
      firestore,
      "users",
      currentUser.uid,
      "pantry"
    );
    const docRef = doc(userInventoryRef, item.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenRecipe = async () => {
    setOpenRecipe(true);
    setLoadingState(true);
    try {
      const response = await fetch("/api/getRecipeSuggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inventory }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }

      const data = await response.json();
      console.log(data.recipeSuggestion);
      setRecipes(data.recipeSuggestion);
      setError("");
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setError(error.message);
    } finally {
      setLoadingState(false);
    }
  };
  const handleCloseRecipe = () => {
    setOpenRecipe(false);
    setRecipes("");
  };

  function searchItem(item) {
    const filteredList = [];

    if (item.length > 0) {
      inventory.map(({ name, quantity }) => {
        if (name.includes(item.toLowerCase())) {
          filteredList.push({ name, quantity });
        }
      });
      setSearch(true);
      setFilterInventory(filteredList);
    } else {
      setSearch(false);
      setFilterInventory(filteredList);
    }
  }

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={360}
          bgcolor="#F5F5DC"
          borderRadius={5}
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          textAlign="center"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              sx={{ bgcolor: "#C0B9DD", borderRadius: "5px" }}
              value={itemName}
              label="Item name"
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            ></TextField>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#4CAF50",
                color: "#000000",
                fontWeight: "600",
                "&:hover": {
                  bgcolor: "#FF9800",
                },
              }}
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              ADD
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box
        display="flex"
        justifyContent="space-between"
        width="max(40vw,355px)"
        bgcolor="#F5F5DC"
        p={2}
        borderRadius={5}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: "#4CAF50",
            fontSize: "max(1vw, 10px)",
            color: "#000000",
            fontWeight: "600",
            "&:hover": {
              bgcolor: "#FF9800",
            },
          }}
          onClick={() => {
            handleOpen();
          }}
        >
          Add New Item
        </Button>
        <TextField
          variant="outlined"
          sx={{ bgcolor: "#C0B9DD", borderRadius: "5px", width: "40%" }}
          label="Search"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            searchItem(e.target.value);
          }}
        ></TextField>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#4CAF50",
            fontSize: "max(1vw, 10px)",
            color: "#000000",
            fontWeight: "600",
            "&:hover": {
              bgcolor: "#FF9800",
            },
          }}
          onClick={() => {
            handleLogOut();
          }}
        >
          Log out
        </Button>
      </Box>
      <Box sx={{ border: 1 }} bgcolor="#F5F5DC">
        <Box
          width="max(40vw,355px)"
          height="100px"
          bgcolor="#F5F5DC"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={1}
          sx={{ borderBottom: 1 }}
        >
          <Typography variant="h2" fontSize="max(4vw, 50px)">
            Pantry Items
          </Typography>
        </Box>
        <Stack
          width="max(40vw,355px)"
          height="300px"
          spacing={1}
          overflow="auto"
        >
          {(search ? filterInventory : inventory).map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="80px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#F5F5DC"
              padding={1}
              sx={{ gap: 2 }} // Add gap for spacing
            >
              <Box flex={1}>
                <Typography variant="h5" color="#333" textAlign="left">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Box>
              <Box flex={1} display="flex" justifyContent="center">
                <Typography variant="h5" color="#333">
                  {quantity}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#4CAF50",
                    color: "#000000",
                    fontWeight: "600",
                    "&:hover": {
                      bgcolor: "#FF9800",
                    },
                  }}
                  onClick={() => {
                    addItem(name);
                  }}
                >
                  +
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#4CAF50",
                    color: "#000000",
                    fontWeight: "600",
                    "&:hover": {
                      bgcolor: "#FF9800",
                    },
                  }}
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  -
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Button
        variant="contained"
        sx={{
          bgcolor: "#4CAF50",
          color: "#000000",
          fontWeight: "600",
          "&:hover": {
            bgcolor: "#FF9800",
          },
        }}
        onClick={() => {
          handleOpenRecipe();
        }}
      >
        Recipe Suggestion
      </Button>
      <Modal open={openRecipe} onClose={handleCloseRecipe}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={360}
          bgcolor="#F5F5DC"
          borderRadius={5}
          boxShadow={24}
          p={4}
          display="flex"
          textAlign="left"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography variant="h6" textAlign="center">
            {loadingState ? "Fetching Recipes..." : "Recipe Suggestions"}
          </Typography>
          <Stack
            width="100%"
            direction="row"
            spacing={2}
            height="300px"
            overflow="auto"
          >
            {recipes && (
              <Typography>
                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose">
                  {recipes}
                </ReactMarkdown>
              </Typography>
            )}
            {error && <Typography color="red">{error}</Typography>}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
