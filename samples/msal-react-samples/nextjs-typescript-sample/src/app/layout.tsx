'use client';

import { MsalProvider } from "@azure/msal-react";
import NavBar from "../components/NavBar";
import { Grid, Typography } from "@mui/material";
import { AuthenticationResult, EventMessage, EventType, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "@/authConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && (event.payload as AuthenticationResult).account) {
    const account = (event.payload as AuthenticationResult).account;
    msalInstance.setActiveAccount(account);
  }
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MsalProvider instance={msalInstance}>
            <NavBar />
            <Typography variant="h5">
                <center>Welcome to the Microsoft Authentication Library For React Next.js Quickstart</center>
            </Typography>
            <br/>
            <br/>
            <Grid container justifyContent="center">
              {children}
            </Grid>
        </MsalProvider>
        </body>
    </html>
  )
}
