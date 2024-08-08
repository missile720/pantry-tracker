"use client";
import { Box, Button, TextField, Typography } from "@mui/material";
import { auth, firestore } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";

export default function AuthorizationPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    verifyPassword: "",
  });
  const [signUp, setSignUp] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAuthorization = async (e) => {
    e.preventDefault();
    //check to see if its a sign in/out
    if (signUp) {
      //verify passwords match to help user
      if (formData.password !== formData.verifyPassword) {
        setPasswordMatch(true);
      } //minimum length requirement for firebase
      else if (formData.password.length < 6) {
        setPasswordLength(true);
      } else {
        //create new user
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );
          const user = userCredential.user;

          await setDoc(doc(firestore, "users", user.uid), {
            email: formData.email,
          });

          router.push("/pantry");
        } catch (error) {
          console.error("Error signing up:", error.code, error.message);
        }
      }
    } else {
      //login user
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        router.push("/pantry");
      } catch (error) {
        console.error("Error signing up:", error.code, error.message);
      }
    }
  };

  const switchPage = () => {
    setSignUp(!signUp);
  };

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width="max(50vw,300px)"
        height={signUp ? 500 : 430}
        borderRadius={5}
        bgcolor="#F5F5DC"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        p={4}
      >
        <Typography
          variant="h1"
          textAlign="center"
          fontSize="max(4vw, 50px)"
          p={0}
        >
          {signUp ? "Sign Up" : "Sign In"}
        </Typography>
        <form onSubmit={handleAuthorization} style={{ width: "100%" }}>
          <Box
            display="flex"
            width="auto"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <TextField
              variant="outlined"
              sx={{
                bgcolor: "#C0B9DD",
                borderRadius: "5px",
              }}
              required
              fullWidth
              type="email"
              name="email"
              value={formData.email}
              label="Email"
              onChange={handleChange}
            ></TextField>
            <TextField
              variant="outlined"
              sx={{
                bgcolor: "#C0B9DD",
                borderRadius: "5px",
              }}
              required
              fullWidth
              value={formData.password}
              type="password"
              name="password"
              label="Password"
              onChange={handleChange}
            ></TextField>
            {signUp && (
              <>
                <TextField
                  variant="outlined"
                  sx={{
                    bgcolor: "#C0B9DD",
                    borderRadius: "5px",
                  }}
                  required
                  fullWidth
                  value={formData.verifyPassword}
                  type="password"
                  label="Verify password"
                  name="verifyPassword"
                  onChange={handleChange}
                ></TextField>
                {passwordMatch && (
                  <Typography color="red">Passwords do not match!</Typography>
                )}
              </>
            )}
            <Button
              variant="contained"
              type="submit"
              sx={{
                bgcolor: "#4CAF50",
                color: "#000000",
                fontWeight: "600",
                "&:hover": {
                  bgcolor: "#FF9800",
                },
              }}
            >
              {signUp ? "Sign Up" : "Sign In"}
            </Button>
          </Box>
        </form>
        <Typography
          variant="p"
          textAlign="center"
          fontSize="max(.5vw, 16px)"
          p={1}
        >
          Or Sign {signUp ? "In" : "Up"}
          <Button
            variant="text"
            sx={{ color: "#FF9800", fontWeight: "600" }}
            onClick={() => switchPage()}
          >
            here
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
