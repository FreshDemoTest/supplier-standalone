// domain
import { SaasSectionType } from "../domain/account/Business";
import { UnitAccountPermissionsType } from "../domain/auth/AccountPermissions";
import { UIVerifiedMenuOption } from "../domain/auth/UIVerifications";

/**
 * Filter units with actual access
 * @param units Array<any>
 * @param allowedPerms UnitAccountPermissionsType[]
 * @returns Array<any>
 */
export const getUnitsAllowed = (
  units: Array<any>,
  allowedPerms: UnitAccountPermissionsType[] | undefined
) => {
  if (!allowedPerms) return [];
  // verify if user is Admin
  const unitAdmin = isAllowedTo(allowedPerms, "usersadmin-unit-view-list");
  // if admin -> see all units
  if (unitAdmin) return units;
  // else -> see only allowed units
  return units.filter((unt) =>
    allowedPerms.map((bp) => bp.unitId).includes(unt.id)
  );
};

/**
 * Verify if it is allowed to do X
 * @param allowedPerms UnitAccountPermissionsType[]
 * @param permissionKey string
 * @returns boolean
 */
export const isAllowedTo = (
  allowedPerms: UnitAccountPermissionsType[] | undefined,
  permissionKey: string
) => {
  if (!allowedPerms) return false;
  const _unitperm = allowedPerms.find((bp) => {
    const admUnPerm = bp.permissions.find((perm) => perm.key === permissionKey);
    return admUnPerm && admUnPerm.validation;
  });
  return _unitperm ? true : false;
};

/**
 * Verify if it is allowed to do X
 * @param uiSects 
 * @param saasConfig 
 * @returns  Array<UIVerifiedMenuOption>
 */
export const verifyAvailableSections = (
  uiSects: Array<UIVerifiedMenuOption>,
  saasConfig: {
    config: {
      sections: SaasSectionType[];
    };
  }
) => {
  const tmpsects = [];
  for (const sect of saasConfig.config.sections) {
    const tmpsect = uiSects.find((s) => s.subheader === sect.section_name);
    // add available tag to items
    if (tmpsect) {
      tmpsect.items = tmpsect.items.map((item) => {
        const tmpSubs = sect.subsections.find(
          (sb: any) => sb.subsection_name === item.title
        );
        return {
          ...item,
          available: tmpSubs ? tmpSubs.available : false,
        };
      });
      tmpsects.push(tmpsect);
    }
  }
  return tmpsects;
};

/**
 * Retrieve UI Section Details
 * @param saasConfig
 * @param subSectionName
 * @returns SaasSectionType | undefined
 */
export const retrieveUISectionDetails = (
  subSectionName: string,
  saasConfig?: {
    config?: {
      sections?: SaasSectionType[];
    };
  },
) => {
  if (!saasConfig || !saasConfig.config || !saasConfig.config.sections) return undefined;
  for (const sect of saasConfig.config.sections) {
    const tmpsect = sect.subsections.find((sb) => sb.subsection_name === subSectionName);
    // add available tag to items
    if (tmpsect) {
      return tmpsect;
    }
  }
  return undefined;
}

/**
 *  Verify if it is allowed to do X
 * @param mobileUiSects 
 * @param saasConfig 
 * @returns Array<{label: string; icon: any; linkTo: string; available: boolean}>
 */
export const verifyAvailableMobileSections = (
  mobileUiSects: {label: string; icon: any; linkTo: string}[],
  saasConfig: {
    config: {
      sections: SaasSectionType[];
    };
  }
) => {
  const tmpMobsects = [];
  const flatSaasSects = saasConfig.config.sections.flatMap((s) => {
    return s.subsections.map((sb) => {
      return {
        label: sb.subsection_name,
        available: sb.available,
      };
    });
  });
  for (const muSec of mobileUiSects) {
    const tmpsect = flatSaasSects.find((s) => s.label === muSec.label);
    // add available tag to items
    tmpMobsects.push({
      ...muSec,
      available: tmpsect ? tmpsect.available : false,
    });
  }
  return tmpMobsects;
};
