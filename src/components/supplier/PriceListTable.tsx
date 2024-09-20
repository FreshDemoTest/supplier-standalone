import {
  Card,
  CardContent,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
// domain
import { PriceListDetailsType } from "../../domain/supplier/SupplierPriceList";
import { UOMType, UOMTypes } from "../../domain/supplier/SupplierProduct";
// utils
import { fCurrency, normalizeText } from "../../utils/helpers";
import { DynamicTableLoader } from "../DynamicLoader";
import SearchBar from "../SearchBar";
import { useEffect, useState } from "react";

// ----------------------------------------------------------------------

type PriceListTableProps = {
  prices: PriceListDetailsType[];
};

const PriceListTable: React.FC<PriceListTableProps> = ({ prices }) => {
  const [search, setSearch] = useState("");
  const [filteredPrices, setFilteredPrices] = useState<PriceListDetailsType[]>(
    []
  );

  // hook to filter products
  useEffect(() => {
    if (!search) {
      setFilteredPrices(prices);
    } else {
      setFilteredPrices(
        prices.filter((p) => {
          const normedS = normalizeText(search);
          return (
            normalizeText(p.description).includes(normedS) ||
            normalizeText(p.sku).includes(normedS)
          );
        })
      );
    }
  }, [search, prices]);

  return (
    <Card sx={{ mt: 1 }}>
      <CardContent>
        {/* Search bar */}
        <SearchBar
          placeholder="Busca productos"
          searchValue={search}
          searchCallback={setSearch}
          searchResultsLength={filteredPrices.length}
        />
        <DynamicTableLoader
          elements={filteredPrices}
          containerSx={{
            minHeight: { xs: 400, md: 600 },
          }}
          headers={
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ pl: 1 }}>
                  Producto
                </TableCell>
                <TableCell align="right">Precio</TableCell>
              </TableRow>
            </TableHead>
          }
          renderMap={(prx) => {
            return prx.map((price, i) => (
              <TableRow key={i}>
                <TableCell align="left" sx={{ pl: 1, maxWidth: 80 }}>
                  <Typography variant="body2">{price.description}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {UOMTypes[price.sellUnit.toLowerCase() as UOMType]}, SKU:{" "}
                    {price.sku}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {fCurrency(price.price.price)} {price.price.currency}
                  </Typography>
                </TableCell>
              </TableRow>
            ));
          }}
        />
      </CardContent>
    </Card>
  );
};

export default PriceListTable;
