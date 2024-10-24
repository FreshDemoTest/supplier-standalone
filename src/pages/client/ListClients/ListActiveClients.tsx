import { useEffect, useRef, useState } from "react";
// material
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import PlusFill from "@iconify/icons-ic/add";
import DownloadFill from "@iconify/icons-ic/file-download";
// routes
import { PATH_APP } from "../../../routes/paths";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
// redux
import {
  clearExportClientsSuccess,
  exportClientsFile,
  getActiveClients,
  getClientCategories,
  setActiveFilters,
  setActiveSearch,
  upsertAssignedSupplierRestaurant,
} from "../../../redux/slices/client";

// components
import SearchBar from "../../../components/SearchBar";
// import FiltersPopover from '../../../components/FiltersPopover';
import ClientCardItem from "../../../components/client/ClientCardItem";
import AddClientPopover from "../../../components/client/AddClientPopover";
import BasicDialog from "../../../components/navigation/BasicDialog";
import { ListUnitOptions } from "../../../layouts/dashboard/UnitSelectPopover";
// domain
import track from "../../../utils/analytics";
import { ClientProfileType } from "../../../domain/client/Client";
import { enqueueSnackbar } from "notistack";
import LoadingProgress from "../../../components/LoadingProgress";
import { DynamicLoader } from "../../../components/DynamicLoader";
import MHidden from "../../../components/extensions/MHidden";
import { Icon } from "@iconify/react";
import { createBlobURI, normalizeText } from "../../../utils/helpers";
import { UnitType } from "../../../domain/account/SUnit";

// ----------------------------------------------------------------------

const searchAndFilter = (
  search: string,
  filters: {
    deliveryType: string[];
    // category: string[];
    // paymentMethod: string[];
    // closingTime: string[];
  },
  clients: ClientProfileType[],
  clientCategories: { label: string; value: string }[],
  sunits?: UnitType[]
) => {
  let filteredClients = clients;
  // search
  if (search) {
    const normedSearch = normalizeText(search);
    filteredClients = filteredClients.filter((clt) => {
      const categ = clientCategories.find(
        (c) => c.value === clt.clientCategory
      );
      const sunit = sunits
        ? sunits.find((s) => s.id === clt.business?.assignedUnit)
        : undefined;
      // filters
      const byUnit =
        !!sunit && normalizeText(sunit.unitName).includes(normedSearch);
      const byCategLabel =
        !!categ && normalizeText(categ.label).includes(normedSearch);
      const byName = normalizeText(clt.branchName).includes(normedSearch);
      const byCateg =
        !!clt.clientCategory &&
        normalizeText(clt.clientCategory).includes(normedSearch);
      const byBiz =
        !!clt.business &&
        !!clt.business.clientName &&
        normalizeText(clt.business.clientName).includes(normedSearch);
      return byName || byCateg || byBiz || byCategLabel || byUnit;
    });
  }
  // filters - multi select filters
  if (
    Object.values(filters)
      .map((v: Array<any>) => v.length)
      .reduce((a: number, b: number) => a + b) > 0
  ) {
    // [TODO] implement in next release
    // delivery type
    // if (filters.deliveryType.length > 0) {
    //   filteredSuppliers = filteredSuppliers.filter((sup) => {
    //     if (!sup.deliveryTypes) return false;
    //     if ((sup.deliveryTypes || []).length === 0) return false;
    //     const dts = sup.deliveryTypes.map((dT: deliveryType) =>
    //       filters.deliveryType.includes(deliveryTypes[dT])
    //     );
    //     return dts.reduce((a: boolean, b: boolean) => a || b);
    //   });
    // }
  }
  return filteredClients;
};

// ----------------------------------------------------------------------

const ListActiveClientsView: React.FC<{}> = () => {
  const theme = useTheme();
  const fetchedCl = useRef(false);
  const { sessionToken } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<any>({
    deliveryType: [],
  });
  const { units } = useAppSelector((state) => state.account);
  const { activeClients, activeFilters, clientCategories, isLoading } =
    useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeUnits = units.filter((u: any) => !u.deleted);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isBranchSelected, setBranchSelected] = useState<string | undefined>(
    undefined
  );
  // const nonDeletedUnits = units.filter((units: UnitType) => !units.deleted);
  const [nonDeletedUnits, setNonDeletedUnits] = useState<UnitType[]>(
    units.filter((units: UnitType) => !units.deleted)
  );

  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const { exportclients } = useAppSelector((state) => state.client);

  // hook - download file
  useEffect(() => {
    if (exportclients.loaded && exportclients.file) {
      // generate url
      const _blobUrl = createBlobURI(exportclients.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportclients.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportClientsSuccess());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportclients]);

  // call to download file
  const handleDownloadExport = async (xformat: string) => {
    try {
      await dispatch(exportClientsFile(xformat, sessionToken || ""));
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      track("view_item_list", {
        visit: window.location.toString(),
        page: "Pedidos",
        section: "SearchBar",
      });
    } catch (err: any) {
      console.warn(err);
      enqueueSnackbar(`Error al descargar archivo ${xformat.toUpperCase()}`, {
        variant: "error",
        autoHideDuration: 2000,
      });
      track("exception", {
        visit: window.location.toString(),
        page: "Pedidos",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  const handleOpenPopover = (branch: ClientProfileType) => {
    setBranchSelected(branch.id);
    const nonDeletedUnits = units.filter(
      (units: UnitType) =>
        !units.deleted && units.id !== branch.business?.assignedUnit
    );
    setNonDeletedUnits(nonDeletedUnits);
    setPopoverOpen(true);
  };

  const handleClosePopover = () => {
    setBranchSelected("");
    setPopoverOpen(false);
  };

  const onClickClient = (client: ClientProfileType) => {
    if (!client.id) {
      console.warn("ClientCardItem: client.id is undefined");
      return;
    }
    navigate(PATH_APP.client.details.replace(":clientId", client.id));
  };

  // fetch active
  useEffect(() => {
    if (!sessionToken || activeUnits.length === 0 || fetchedCl.current) return;
    const activeUnitIds = activeUnits.map((u: any) => u.id);
    const _getClients = async () => {
      try {
        await dispatch(getActiveClients(activeUnitIds, sessionToken));
      } catch (error) {
        console.error(error);
        enqueueSnackbar("No se pudieron cargar los clientes", {
          variant: "error",
        });
      }
    };
    _getClients();
    fetchedCl.current = true;
    if (clientCategories.length === 0) {
      dispatch(getClientCategories());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken, activeUnits]);

  // effects
  useEffect(() => {
    setSearch(activeFilters.search);
    setSelectedFilters({
      deliveryType: activeFilters.deliveryType,
    });
  }, [dispatch, activeFilters]);

  // search
  const handleSearch = (value: string) => {
    dispatch(setActiveSearch(value));
    track("search", {
      visit: window.location.toString(),
      page: "ListClients",
      section: "SearchBar",
      search: value,
    });
  };

  // filter
  const handleFilters = (filts: any) => {
    dispatch(
      setActiveFilters({
        ...filts,
        search: search,
      })
    );
    track("select_content", {
      visit: window.location.toString(),
      page: "ListClients",
      section: "SearchBar",
      filters: filts,
    });
  };

  // filters
  // const filterOptions = [
  //   {
  //     label: 'Tipo de entrega',
  //     key: 'deliveryType',
  //     options: activeClients
  //       .map((sup: ClientBranchType) =>
  //         sup.deliveryTypes.map((dt: any) => decodeDeliveryTypes(dt))
  //       )
  //       .filter((v: Array<any>) => v.length > 0)
  //       .reduce((a: any, b: any) => {
  //         for (let j of b) {
  //           if (!a.includes(j)) a.push(j);
  //         }
  //         return a;
  //       }, [])
  //   },
  // ];

  //  on delete filter
  const onDeleteFilter = (filt: { k: string; v: string }) => {
    const filterName = filt.k;
    const filterValue = filt.v;
    const newFilters = { ...selectedFilters };
    const newFilterValues = newFilters[filterName].filter(
      (v: any) => v !== filterValue
    );
    newFilters[filterName] = newFilterValues;
    handleFilters(newFilters);
  };

  // filtering & searching
  const filteredClients = searchAndFilter(
    search,
    selectedFilters,
    activeClients,
    clientCategories,
    units
  );

  // filtering chips
  const filteringChips =
    selectedFilters.deliveryType.map((val: any) => ({
      m: `Entrega: ${val}`,
      c: { k: "deliveryType", v: val },
    })) || [];

  // handlers
  const handleSelectUnit = async (unit: UnitType) => {
    if (unit && isBranchSelected !== "") {
      try {
        await dispatch(
          upsertAssignedSupplierRestaurant(
            unit?.id,
            isBranchSelected,
            sessionToken || ""
          )
        );
        enqueueSnackbar("El cliente ha sido assignado correctamente", {
          variant: "success",
        });
        navigate(PATH_APP.client.root);
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar("Error al reasignar cliente", {
          variant: "error",
        });
      }
    }
    handleClosePopover();
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={10} md={7}>
          {/* Search bar */}
          <SearchBar
            placeholder="Buscar clientes ..."
            searchValue={search}
            searchCallback={handleSearch}
            searchResultsLength={filteredClients.length}
          />
        </Grid>
        <Grid item xs={0} md={4}>
          {/* Desktop only */}
          <MHidden width="mdDown">
            <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
              <Button
                size="medium"
                fullWidth
                startIcon={
                  <Icon
                    icon={PlusFill}
                    width={24}
                    height={24}
                    color={theme.palette.text.secondary}
                  />
                }
                onClick={() => {
                  navigate(PATH_APP.client.add.form);
                  track("select_content", {
                    visit: window.location.toString(),
                    section: "SearchBar",
                    page: "ListActiveClients",
                  });
                }}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.text.secondary,
                  boxShadow: theme.shadows[2],
                  mx: theme.spacing(2),
                }}
              >
                Agregar Cliente
              </Button>
            </Box>
          </MHidden>
        </Grid>
        <Grid item xs={2} md={1}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              [theme.breakpoints.down("md")]: {
                justifyContent: "center",
              },
            }}
          >
            {/* Search bar */}
            <IconButton
              sx={{
                visibility: activeClients.length > 0 ? "visible" : "hidden",
              }}
              onClick={() => {
                setOpenDownloadDiag(true);
              }}
            >
              <Icon icon={DownloadFill} width={28} height={28} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Filter badges */}
      <Box sx={{ overflowX: "scroll", flexDirection: "row" }}>
        {filteringChips.map((c: { m: string; c: any }) => (
          <Chip
            key={c.m}
            label={c.m}
            sx={{
              mt: theme.spacing(1),
              mx: theme.spacing(1),
              px: theme.spacing(2),
              backgroundColor: theme.palette.grey.A400,
              color: theme.palette.common.white,
              fontWeight: "bold",
            }}
            onDelete={() => {
              onDeleteFilter(c.c);
            }}
          />
        ))}
      </Box>

      {/* List of active clients */}
      {isLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {!isLoading && (
        <DynamicLoader
          elements={filteredClients}
          containerSx={{ mt: 4, minHeight: { xs: 660, md: 880 } }}
          headers={
            <>
              {filteringChips.length > 0 &&
                filteredClients.length === 0 &&
                activeClients.length > 0 &&
                !isLoading && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: theme.spacing(2) }}
                  >
                    No hay resultados con estos filtros.
                  </Typography>
                )}

              {/* Message of empty active clients */}
              {activeClients.length === 0 && !isLoading && (
                <Box sx={{ my: theme.spacing(3) }}>
                  <Typography variant="h5" align="center">
                    No hay clientes dados de alta.
                  </Typography>
                </Box>
              )}
            </>
          }
          renderMap={(fltCls) => {
            return fltCls.map((clt) => (
              <Box key={clt.id} sx={{ mb: theme.spacing(2) }}>
                <ClientCardItem
                  client={clt}
                  categories={clientCategories}
                  onClick={() => {
                    onClickClient(clt);
                  }}
                  sunits={units}
                  options={
                    !clt?.business?.active
                      ? [
                          {
                            label: "Editar cliente",
                            onClick: () => {
                              navigate(
                                PATH_APP.client.edit.replace(
                                  ":clientId",
                                  clt.id || ""
                                )
                              );
                            },
                          },
                          {
                            label: "Reasignar Cedis",
                            onClick: () => {
                              handleOpenPopover(clt);
                            },
                          },
                        ]
                      : [
                          {
                            label: "Reasignar Cedis",
                            onClick: () => {
                              handleOpenPopover(clt);
                            },
                          },
                        ]
                  }
                />
              </Box>
            ));
          }}
        />
      )}
      {isPopoverOpen && (
        <BasicDialog
          open={isPopoverOpen}
          onClose={handleClosePopover}
          title="Elije Cedis a Asignar"
          msg="Elije el cedis al cual se asignará el cliente"
          closeMark={true}
        >
          <ListUnitOptions
            unitOptions={nonDeletedUnits}
            onSelect={handleSelectUnit}
          />
          {units.length === 0 && (
            <Box sx={{ textAlign: "center" }}>
              <Button
                color="info"
                onClick={async () => {
                  handleClosePopover();

                  // await delay(500);
                }}
              >
                Regresar
              </Button>
            </Box>
          )}
        </BasicDialog>
      )}
      <BasicDialog
        closeMark
        open={openDownloadDiag}
        onClose={() => setOpenDownloadDiag(false)}
        title={"Descargar Clientes"}
        msg={"Selecciona el formato de descarga de tu clientes"}
        continueAction={{
          active: true,
          msg: "Excel (XLSX)",
          actionFn: () => handleDownloadExport("xlsx"),
        }}
        backAction={{
          active: true,
          msg: "CSV",
          actionFn: () => handleDownloadExport("csv"),
        }}
      ></BasicDialog>
      {/* Mobile - Fixed add supplier button */}
      <MHidden width="mdUp">
        <AddClientPopover />
      </MHidden>
    </Box>
  );
};

export default ListActiveClientsView;
