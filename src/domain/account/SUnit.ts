import { paymentMethodType } from '../orden/Orden';
import { DeliveryType } from '../supplier/SupplierProduct';

export type UnitType = {
  id?: string;
  unitName: string;
  unitCategory?: string;
  street?: string;
  externalNum?: string;
  internalNum?: string;
  neighborhood?: string;
  city?: string;
  estate?: string;
  country?: string;
  zipCode?: string;
  deleted?: boolean;
  paymentMethods?: paymentMethodType[],
  accountNumber?: string,
};

export const DoW = {
  sunday: 'Domingo',
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado'
};

export const DoWIdx = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

export const reverseDoWIdx = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export type ServiceDayType = {
  dow: keyof typeof DoW;
  start: number; // 0-22 hrs
  end: number; // 1-23 hrs
};

export type DeliveryZoneType = {
  zoneName: string;
  estate?: string;
  city?: string;
  neighborhood?: string;
  zipCode?: string;
};

const _deliveryZones: {
  zoneName: string;
  estate?: string;
  city?: string[];
  neighborhood?: string[];
  zipCode?: string[];
}[] = require('../supplier/deliveryZones.json');

export const DeliveryZones: DeliveryZoneType[] = _deliveryZones.map((dz) => {
  return {
    zoneName: dz.zoneName,
    estate: dz.estate,
    city: dz.city?.join(', '),
    neighborhood: dz.neighborhood?.join(', '),
    zipCode: dz.zipCode?.join(', ')
  };
});

export type UnitDeliveryInfoType = {
  deliveryTypes: DeliveryType[];
  deliverySchedules: ServiceDayType[];
  deliveryZones: string[];
  deliveryWindowSize?: number; // in hours
  cutOffTime?: number; // 0-23 hrs
  warnDays?: number; // days before delivery date
};

export const InvoicePaymentMethods = {
  PUE: 'PUE: Pago en una sola exhibición',
  PPD: 'PPD: Pago en parcialidades o diferido'
};

export const InvoicingTriggers = {
  deactivated: 'Desactivado',
  at_purchase: 'Al Confirmar Orden De Venta',
  at_delivery: 'Al Marcar Orden De Venta Como Entregado'
};

export type UnitInvoiceInfoType = {
  taxId?: string;
  fiscalRegime?: string;
  legalBusinessName?: string;
  taxZipCode?: string;
  certificateFile?: File;
  secretsFile?: File;
  passphrase?: string;
  invoicePaymentMethod?: keyof typeof InvoicePaymentMethods;
  invoicingTrigger?: keyof typeof InvoicingTriggers;
};

export type UnitPOCType = {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
};

export type UnitStateType = UnitType &
  UnitInvoiceInfoType & { fullAddress: string };

const _fiscalRegimes = {
  601: 'General de Ley Personas Morales',
  603: 'Personas Morales con Fines no Lucrativos',
  605: 'Sueldos y salarios e ingresos asimilados a salarios',
  606: 'Régimen de Arrendamiento',
  607: 'Enajenación de bienes',
  608: 'Demás ingresos',
  610: 'Residentes en el Extranjero sin Establecimiento Permanente en México',
  612: 'Régimen de Actividades Empresariales y Profesionales',
  614: 'Intereses',
  615: 'Obtención de premio',
  616: 'Sin obligaciones fiscales',
  620: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
  621: 'Régimen de Incorporación Fiscal',
  622: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  623: 'Opcional para Grupos de Sociedades',
  624: 'Coordinados',
  625: 'Régimen de Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  626: 'Régimen Simplificado de Confianza'
};

export const FiscalRegimes = Object.entries(_fiscalRegimes).map((v) => ({
  value: v[0],
  label: v[1]
}));

const _cfdiUses = {
  G01: 'Adquisición de mercancías',
  G02: 'Devoluciones, descuentos o bonificaciones',
  G03: 'Gastos en general',
  I01: 'Construcciones',
  I02: 'Mobilario y equipo de oficina por inversiones',
  I03: 'Equipo de transporte',
  I04: 'Equipo de computo y accesorios',
  I05: 'Dados, troqueles, moldes, matrices y herramental',
  I06: 'Comunicaciones telefónicas',
  I07: 'Comunicaciones satelitales',
  I08: 'Otra maquinaria y equipo',
  D01: 'Honorarios médicos, dentales y gastos hospitalarios.',
  D02: 'Gastos médicos por incapacidad o discapacidad',
  D03: 'Gastos funerales.',
  D04: 'Donativos.',
  D05: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).',
  D06: 'Aportaciones voluntarias al SAR.',
  D07: 'Primas por seguros de gastos médicos.',
  D08: 'Gastos de transportación escolar obligatoria.',
  D09: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.',
  D10: 'Pagos por servicios educativos (colegiaturas)',
  S01: 'Sin efectos fiscales.',
  CP01: 'Pagos',
  CN01: 'Nómina'
};

export const CfdiUses = Object.entries(_cfdiUses).map((v) => ({
  value: v[0],
  label: v[1]
}));
