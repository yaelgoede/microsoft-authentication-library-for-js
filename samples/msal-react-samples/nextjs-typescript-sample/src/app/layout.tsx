'use client';

import NavBar from "../components/NavBar";
import { Typography } from "@mui/material";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
            <NavBar />
            <Typography variant="h5">
                <center>Welcome to the Microsoft Authentication Library For React Next.js Quickstart</center>
            </Typography>
            <br/>
            <br/>
            {children}
        </body>
    </html>
  )
}
