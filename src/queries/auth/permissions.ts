export const GET_PERMISSIONS = `query getSupPermissions {
  getSupplierPermissionsFromToken {
    ... on SupplierUserEmployeeGQL {
      supplierUser {
        coreUserId
        role
        enabled
        deleted
      }
      permission {
        supplierBusinessId
        displaySalesSection
        displayRoutesSection
      }
      employee {
        supplierUserId
        position
        phoneNumber
        firstName: name
        lastName
        email
        department
        unitPermissions {
          unitId
          permissions {
            key
            validation
          }
        }
      }
    }
    ... on SupplierUserError {
      code
    }
  }
}`;
