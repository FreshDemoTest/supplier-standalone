import { DoW, ServiceDayType } from "../domain/account/SUnit";
import { UserType } from "../domain/account/User";
import { CartProductType, InvoiceType, OrdenType } from "../domain/orden/Orden";
import {
  isSunday,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
} from "date-fns";

// ----------------------------------------------------------------------

// time helpers
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

export const inTwoWeeks = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
};

export const inXTime = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// ----------------------------------------------------------------------
// format helpers
export const fISODate = (value: Date | any) => {
  if (!value) {
    return "-";
  }
  let dhs = new Date(value);
  dhs.setHours(0, 0, 0, 0);
  const _tmp = dhs.toISOString().split("T")[0];
  return _tmp;
};

export const fDateTime = (value: Date | any) => {
  if (!value) {
    return "-";
  }
  let dhs = new Date(value);
  let _hr = dhs.getHours() - 6;
  // if hr is negative, add 24 and remove a day in the date
  if (_hr < 0) {
    _hr += 24;
    dhs.setDate(dhs.getDate() - 1);
  }
  let s_hr = `${_hr}`;
  if (_hr < 10) {
    s_hr = `0${_hr}`;
  }
  // set timezone
  let hrs = ` ${s_hr}:${dhs.getMinutes() < 10 ? "0" : ""}${dhs.getMinutes()}`;
  dhs.setHours(0, 0, 0, 0);
  const _tmp = dhs.toISOString().split("T")[0] + hrs;
  return _tmp;
};

export const fMonthYearDate = (value: Date | any, locale: string = "es") => {
  if (!value) {
    return "-";
  }
  const _tmp = new Date(value).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return _tmp;
};

export const fDateMonth = (value: Date | any, locale: string = "es") => {
  if (!value) {
    return "-";
  }
  const _tmp = new Date(value).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return _tmp.replaceAll("de", "");
};

export const displayUsername = (cUser: UserType | undefined) => {
  if (!cUser) return "";
  return (cUser?.firstName + " " || " ") + (cUser?.lastName || "");
};

export const fCurrency = (value: number | any) => {
  if (!value) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
  })
    .format(value)
    .replace("MX$", "$");
};

export const fNoCentsCurrency = (value: number | any) => {
  if (!value) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
  })
    .format(value)
    .replace("MX$", "$")
    .split(".")[0];
};

export function fPercent(number: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(number / 100);
}

export function fPercentDec(perNum: number) {
  return `${perNum.toFixed(2)}%`;
}

export function fQuantity(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
  })
    .format(value)
    .replace("MX$", "");
}

export function fOperationDays(days: ServiceDayType[]) {
  // group days by operations time
  const groupedDays = days
    .map((d) => ({ sched: `${d.start} - ${d.end}hrs`, dow: DoW[d.dow] }))
    .reduce((acc, v) => {
      if (Object.keys(acc).includes(v.sched)) {
        acc[v.sched].push(v.dow);
      } else {
        acc[v.sched] = [v.dow];
      }
      return acc;
    }, {} as { [key: string]: string[] });
  // format grouped days
  return Object.entries(groupedDays).map(([sched, days]) => {
    return `${days.join(", ")}: ${sched}`;
  });
}

export function getDow(day: Date) {
  if (isSunday(day)) return "sunday";
  if (isMonday(day)) return "monday";
  if (isTuesday(day)) return "tuesday";
  if (isWednesday(day)) return "wednesday";
  if (isThursday(day)) return "thursday";
  if (isFriday(day)) return "friday";
  if (isSaturday(day)) return "saturday";
  return "";
}

export function findBillingPeriodStart(
  createdAt: Date | string,
  period: "month" | "year"
) {
  const _date = new Date(createdAt);
  const _today = new Date();
  // for month -> same day of the month + current month + current year
  if (period === "month") {
    let bpsDate = new Date(
      _today.getFullYear(),
      _today.getMonth(),
      _date.getDate()
    );
    // if the date is in the future, go back one month
    if (bpsDate.getDate() > _today.getDate()) {
      if (bpsDate.getMonth() === 0) {
        bpsDate.setFullYear(bpsDate.getFullYear() - 1);
        bpsDate.setMonth(11);
        return bpsDate;
      }
      bpsDate.setMonth(bpsDate.getMonth() - 1);
      return bpsDate;
    }
    // return the generated start date
    return bpsDate;
  }
  // for year -> same day and month + current year
  else {
    let bpsDate = new Date(
      _today.getFullYear(),
      _date.getMonth(),
      _date.getDate()
    );
    // if the date is in the future, go back one year
    if (bpsDate.getMonth() > _today.getMonth()) {
      bpsDate.setFullYear(bpsDate.getFullYear() - 1);
      return bpsDate;
    }
    // return the generated start date
    return bpsDate;
  }
}

export function findBillingPeriodEnd(
  startDate: Date,
  period: "month" | "year"
) {
  if (period === "month") {
    let bpeDate = new Date(startDate);
    if (bpeDate.getMonth() === 11) {
      bpeDate.setFullYear(bpeDate.getFullYear() + 1);
      bpeDate.setMonth(0);
      return bpeDate;
    }
    bpeDate.setMonth(bpeDate.getMonth() + 1);
    return bpeDate;
  } else {
    let bpeDate = new Date(startDate);
    bpeDate.setFullYear(bpeDate.getFullYear() + 1);
    return bpeDate;
  }
}

// ----------------------------------------------------------------------
// business logic helpers

export function isDisabledDay(day: Date, delivSched: ServiceDayType[]) {
  const whichDow = getDow(day);
  const isDisabled = delivSched.find((d) => d.dow === whichDow);
  return isDisabled ? false : true;
}

export function generateSupplierTimeOptions(
  day: Date,
  delivSched: ServiceDayType[],
  deliveryWindowSize: number
) {
  const whichDow = getDow(new Date(day));
  const _schedule = delivSched.find((d) => d.dow === whichDow);
  if (!_schedule) return [];
  // build from schedule
  const { start, end } = _schedule;
  //  -- past allocation stategy
  // const numSlots = Math.round(end - start) - deliveryWindowSize + 1;
  // const timeOptions = [...Array(numSlots)].map((_, i) => {
  //   return i + start;
  // });
  //  -- new allocation strategy
  const timeOptions = [];
  let i = start;
  while (i < end) {
    timeOptions.push(i);
    i += deliveryWindowSize;
  }
  return timeOptions.map((time) => {
    return {
      label: `Entre (${time} - ${time + deliveryWindowSize}hrs)`,
      value: `${time} - ${time + deliveryWindowSize}`,
    };
  });
}

export function isMinimumQtyReached(
  cart: CartProductType[],
  minQty: number,
  minQtyUnit: string
) {
  const cartSubts = cart.map(
    (item) =>
      (item.price?.amount || 0) *
      item.quantity *
      (item.supplierProduct.unitMultiple || 1)
  );
  const weightSubts = cart.map(
    (item) =>
      (item.supplierProduct.estimatedWeight || 1) *
      item.quantity *
      (item.supplierProduct.unitMultiple || 1)
  );
  const _subWOTax = cartSubts.reduce((acc, sub) => acc + sub, 0);
  const sumWeight = weightSubts.reduce((acc, sub) => acc + sub, 0);
  if (minQtyUnit === "kg") {
    // review by weight
    return {
      flag: sumWeight >= minQty,
      amountStr: `${sumWeight} / ${minQty} Kgs`,
    };
  } else if (minQtyUnit === "pesos") {
    // review by money
    return {
      flag: _subWOTax >= minQty,
      amountStr: ` ${fCurrency(_subWOTax)} / ${fCurrency(minQty)}`,
    };
  } else {
    // review by num prods
    return {
      flag: cart.length >= minQty,
      amountStr: `${cart.length} / ${minQty} Productos`,
    };
  }
}

// ----------------------------------------------------------------------
// reduction helpers
const xor = (a: boolean, b: boolean) => {
  return (a || b) && !(a && b);
};

export const reduceBoolArray = (
  array: boolean[],
  operator: "or" | "and" | "xor" = "or"
) => {
  if (operator === "or") {
    // or
    return array.reduce((acc, v) => acc || v, false);
  } else if (operator === "xor") {
    // xor
    return array.reduce((acc, v) => xor(acc, v), false);
  } else {
    // and
    return array.reduce((acc, v) => acc && v, true);
  }
};

export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replaceAll(",", "")
    .replaceAll(".", "")
    .replaceAll("/", "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function roundDownToNearestMultiple(
  num: number,
  multiple: number
): number {
  return Math.floor(num / multiple) * multiple;
}

// ----------------------------------------------------------------------
// cart helpers
export const computeCartTotals = (
  cart: CartProductType[],
  shipping?: number
) => {
  // [TODO] implement Aux Costs computation - Shipping, service fee, ...
  const newCart = cart.map((item) => {
    return {
      ...item,
      total:
        (item.price?.amount || 0) *
        item.quantity *
        (item.supplierProduct.unitMultiple || 1),
    };
  });
  const cartSubts = cart.map(
    (item) =>
      (item.price?.amount || 0) *
      item.quantity *
      (item.supplierProduct.unitMultiple || 1)
  );
  const cartTaxs = cart.map(
    (item) =>
      (item.supplierProduct.taxAmount || 0) *
        (item.price?.amount || 0) *
        item.quantity *
        (item.supplierProduct.unitMultiple || 1) +
      (item.supplierProduct.iepsAmount || 0) *
        (item.price?.amount || 0) *
        item.quantity *
        (item.supplierProduct.unitMultiple || 1)
  );
  const _subtotal = cartSubts.reduce((acc, sub) => acc + sub, 0);
  const _tax = cartTaxs.reduce((acc, tax) => acc + tax, 0);
  const _subWOTax = _subtotal - _tax;
  // [TODO] - add delivery costs, packaging costs, service fee, discount
  const _total = _subtotal + (shipping || 0);
  return {
    shippingCost: shipping,
    packagingCost: undefined,
    serviceFee: undefined,
    discount: {
      amount: undefined,
      code: "",
    },
    subtotalWithoutTax: _subWOTax,
    subtotal: _subtotal,
    tax: _tax,
    total: _total,
    cart: {
      id: undefined,
      cartProducts: newCart,
    },
  };
};

export const computeOrdersTotals = (ordenes: OrdenType[]) => {
  // [TODO] implement Aux Costs computation - Shipping, service fee, ...

  const totalSum: number = ordenes.reduce(
    (acc, orden) => acc + (orden.total ?? 0),
    0
  );
  return {
    total: totalSum,
  };
};

export const sumValuesInList = (
  selectedConsolidatedOrders: (OrdenType & { invoice?: InvoiceType } & {
    paymentAmount?: string | number;
  })[]
): number => {
  const totalPaymentAmount: number = selectedConsolidatedOrders.reduce(
    (sum, order) => {
      // Check if paymentAmount is a number and not undefined
      if (
        typeof order.paymentAmount === "number" &&
        order.paymentAmount !== undefined
      ) {
        return sum + order.paymentAmount;
      } else {
        return sum;
      }
    },
    0
  );
  return totalPaymentAmount;
};

// ----------------------------------------------------------------------
// random helpers

export function generateUUID() {
  return crypto.randomUUID();
}

// ----------------------------------------------------------------------
// encoding helpers

export function decodeFile(tmp: any): File {
  const contentDecoded = window.atob(tmp.content);
  const byteArray = new Uint8Array(contentDecoded.length);

  for (let i = 0; i < contentDecoded.length; i++) {
    byteArray[i] = contentDecoded.charCodeAt(i);
  }

  const blob = new Blob([byteArray], { type: tmp.mimetype });
  const file = new File([blob], tmp.filename);

  return file;
}

export const createBlobURI = (file: File) => {
  const blob = new Blob([file], { type: file.type });
  const url = window.URL.createObjectURL(blob);
  return url;
};

export const fileToString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

// ----------------------------------------------------------------------
// error handling helpers

export function displayInvoiceExecutionError(result: string) {
  try {
    const _result = JSON.parse(result);
    if (_result.error) {
      // Error al generar factura.
      if (_result.error.includes("Error al generar la factura en SAT:")) {
        let errorMsg = "Error al generar la factura en SAT: ";
        let errorDetailStr = _result.error
          .split("Error al generar la factura en SAT:")[1]
          .trim()
          .replace("}.", "}");
        let errorDetail = JSON.parse(errorDetailStr);
        if (errorDetail.Message) {
          errorMsg += errorDetail.Message;
        }
        else {
          return _result.error;
        }
        if (errorDetail.ModelState) {
          errorMsg += Object.values(errorDetail.ModelState)
            .map((ms) => {
              return (Array.isArray(ms) ? ms : [ms]).join(", ");
            })
            .join(". ");
        }
        return errorMsg;
      }
      // Info de facturacion del cliente incorrecta
      if (
        _result.error.includes(
          "La información de facturación del cliente no es correcta:"
        )
      ) {
        let errorMsg =
          "La información de facturación del cliente no es correcta: ";
        let errorDetailStr = _result.error
          .split("La información de facturación del cliente no es correcta:")[1]
          .trim()
          .replace("}.", "}");
        let errorDetail = JSON.parse(errorDetailStr);
        if (errorDetail.Message) {
          errorMsg += `${errorDetail.Message} `;
        } else {
          return _result.error;
        }
        if (errorDetail.ModelState) {
          errorMsg += Object.values(errorDetail.ModelState)
            .map((ms) => {
              return (Array.isArray(ms) ? ms : [ms]).join(", ");
            })
            .join(". ");
        }
        return errorMsg;
      }
      return _result.error;
    }
    return result;
  } catch (e) {
    return result;
  }
}
