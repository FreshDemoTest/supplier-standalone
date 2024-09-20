import { useEffect, useRef, useState } from "react";
// material
import { Box, Button, Typography, useTheme } from "@mui/material";
import PlusFill from "@iconify/icons-ic/add";
import { Icon } from "@iconify/react";
// hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
// routes
import { PATH_APP } from "../../../routes/paths";
// components
import PersonelItem from "../../../components/account/PersonelItem";
import BasicDialog from "../../../components/navigation/BasicDialog";
import LoadingProgress from "../../../components/LoadingProgress";
// domain
import { UserInfoType, UserPermissionType } from "../../../domain/account/User";
// hooks
import { useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
// redux
import {
  deleteTeamMember,
  getTeamMembers,
} from "../../../redux/slices/account";
// utils
import { mixtrack } from "../../../utils/analytics";

// ----------------------------------------------------------------------

const ListTeam: React.FC<{}> = () => {
  const isFetchedRef = useRef(false);
  const { sessionToken } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    business,
    team: allTeam,
    isLoading,
  } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserPermissionType | null>(
    null
  );
  // fetch team from backend
  useEffect(
    () => {
      if (isFetchedRef.current) return;
      if (!business.id) return;
      isFetchedRef.current = true;
      dispatch(getTeamMembers(business.id, sessionToken || ""));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, business]
  );

  // filter team of not deleted users
  const team = allTeam.filter((person: any) => !person.user.deleted);

  return (
    <>
      {/* Loading screen */}
      {isLoading && <LoadingProgress sx={{ mt: 2 }} />}
      {/* Confirm delete dialog */}
      <BasicDialog
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        title="Eliminar personal"
        msg="¿Estás seguro de eliminar a esta persona del equipo?"
        continueAction={{
          active: true,
          msg: "Eliminar",
          actionFn: async () => {
            await dispatch(
              deleteTeamMember(userToDelete?.user?.id || "", sessionToken || "")
            );
            mixtrack("delete_employee", {
              businessId: business.id,
              supplierUserId: userToDelete?.user?.id || "",
              visit: window.location.toString(),
              page: "Account",
              section: "Personel",
            });
            dispatch(getTeamMembers(business.id, sessionToken || ""));
            setOpenConfirmDelete(false);
          },
        }}
        backAction={{
          active: true,
          msg: "Cancelar",
          actionFn: () => setOpenConfirmDelete(false),
        }}
      />
      {/* Team members list */}
      {!isLoading && (
        <Box sx={{ mt: 3 }}>
          {team.length > 0 && (
            <>
              {team.map(
                (person: UserPermissionType & UserInfoType, ix: number) => (
                  <PersonelItem
                    key={ix}
                    topCaption={`${person.role}, ${person.department}`}
                    mainLabel={`${person.user.firstName} ${person.user.lastName}`}
                    subLabel={`Tel. ${person.user.phoneNumber || "-"}, ${
                      person.user.email || "-"
                    }`}
                    options={[
                      {
                        label: "Editar",
                        onClick: () =>
                          navigate(
                            PATH_APP.account.team.edit.replace(
                              ":userId",
                              person?.user?.id || ""
                            )
                          ),
                      },
                      {
                        label: "Eliminar",
                        onClick: () => {
                          setUserToDelete(person);
                          setOpenConfirmDelete(true);
                        },
                      },
                    ]}
                  />
                )
              )}
            </>
          )}
          {team.length === 0 && (
            <Box sx={{ my: theme.spacing(1) }}>
              <Typography variant="h5" align="center">
                No hay personal dado de alta.
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color={"text.secondary"}
              >
                Agrega a todas las personas de tu equipo de trabajo.
              </Typography>
            </Box>
          )}

          <Box textAlign={"center"}>
            <Button
              variant="contained"
              startIcon={
                <Icon
                  icon={PlusFill}
                  width={24}
                  height={24}
                  color={theme.palette.text.secondary}
                />
              }
              onClick={() => {
                mixtrack("add_employee_click", {
                  businessId: business.id,
                  visit: window.location.toString(),
                  page: "Account",
                  section: "Personel",
                });
                navigate(PATH_APP.account.team.add);
              }}
              sx={{
                mt: theme.spacing(2),
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.secondary,
                boxShadow: theme.shadows[2],
                px: theme.spacing(2),
              }}
            >
              Agregar Personal
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ListTeam;
