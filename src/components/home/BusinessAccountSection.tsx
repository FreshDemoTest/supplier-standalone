// material
import { Box, Grid, Typography, useTheme } from "@mui/material";
// components
import MAvatar from "../extensions/MAvatar";
// hooks
// utils
import createAvatar from "../../utils/createAvatar";

// ----------------------------------------------------------------------

export type BusinessAccountSectionProps = {
  businessName: string;
  businessId?: string;
  userName: string;
};

const BusinessAccountSection: React.FC<BusinessAccountSectionProps> = ({
  businessName,
  userName,
}) => {
  const theme = useTheme();
  const avatar = createAvatar(userName);
  return (
    <Grid
      container
      spacing={1}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
    >
      <Grid item xs={12} lg={8}>
        <Grid container>
          <Grid item xs={4} lg={3}>
            <Box
              sx={{
                pl: { xs: theme.spacing(2), lg: theme.spacing(8) },
              }}
            >
              <MAvatar
                src={""}
                alt={userName}
                color={avatar.color}
                sx={{
                  width: theme.spacing(8),
                  height: theme.spacing(8),
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: theme.typography.h3.fontWeight,
                }}
                {...{ variant: "circular" }}
              >
                {avatar.name}
              </MAvatar>
            </Box>
          </Grid>
          <Grid item xs={8} lg={9}>
            <Typography variant="h5" color={"text.secondary"}>
              ¡Bienvenido {userName}!
            </Typography>
            <Box sx={{ mt: theme.spacing(1) }}>
              <Typography
                variant="subtitle1"
                color={"text.secondary"}
                sx={{ fontWeight: theme.typography.fontWeightRegular }}
              >
                {businessName}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BusinessAccountSection;
