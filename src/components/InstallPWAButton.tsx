// Install PWA Button Component
// References:
//   - https://web.dev/learn/pwa/installation-prompt/
//   - https://web.dev/customize-install/
// Alternative implementation: https://radzion.medium.com/install-button-in-pwa-react-redux-3b061f27735a
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import InstallIcon from "@mui/icons-material/Download";
import { Typography } from "@mui/material";

type ButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  text: string;
};

const PWAInstallButton: React.FC<ButtonProps> = ({ onClick, text }) => {
  return (
    <Button
      fullWidth
      aria-label="Instalar app"
      title="Instalar app"
      onClick={onClick}
      variant="contained"
      color="info"
      endIcon={<InstallIcon />}
    >
      {text}
    </Button>
  );
};

const InstallPWAButton: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState<Boolean>(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState<Boolean>(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      console.log("PWA ready to be installed");
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const instHandler = (e: Event) => {
      // PWA already installed
      setIsPWAInstalled(true);
      setPromptInstall(null);
      console.log("PWA already installed");
    };
    window.addEventListener("appinstalled", instHandler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  if (!supportsPWA) {
    if (promptInstall) {
      console.log("PWA not supported!");
    }
    return null;
  }

  if (isPWAInstalled) {
    return null;
  }

  const clickPWAListener = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  return (
    <>
      <Typography
        variant="body2"
        align="center"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        ¿Quieres acceso directo?
      </Typography>
      <PWAInstallButton text="Instala la App" onClick={clickPWAListener} />
    </>
  );
};

export default InstallPWAButton;
