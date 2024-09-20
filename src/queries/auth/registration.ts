export const REGISTER_USER = `mutation newSupplierUser($email: String!, $firebaseId: String!, $firstName: String!, $lastName: String!, $phoneNumber: String!, $role: String!) {
    newSupplierUser(
      email: $email
      firebaseId: $firebaseId
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
      role: $role
    ) {
      ... on SupplierUserGQL {
        id
        user {
          phoneNumber
          email
          firstName
          lastName
        }
        enabled
        role
        deleted
        coreUserId
      }
      ... on SupplierUserError {
        code
        msg
      }
    }
  }`;

export const GET_USER = `query getSupUserByToken {
  getSupplierUserFromToken {
    ... on SupplierUserGQL {
      id
      user {
        phoneNumber
        email
        firstName
        lastName
      }
      enabled
      role
      deleted
      coreUserId
    }
    ... on SupplierUserError {
      code
      msg
    }
    }
  }`;

export const NEW_SUPPLIER_EMPLOYEE = `mutation newSupplierEmployee($email: String!, $firstName: String!, $lastName: String!, $phoneNumber: String!, $department: String!, $position: String!, $supBusId: UUID!, $perms: [SupplierEmployeeInfoPermissionInput!]!) {
  newSupplierEmployee(
    email: $email
    lastName: $lastName
    name: $firstName
    phoneNumber: $phoneNumber
    department: $department
    position: $position
    supplierBusinessId: $supBusId
    displayPerms: {displaySalesSection: true, displayRoutesSection: true}
    permission: $perms
  ) {
    ... on SupplierUserEmployeeGQL {
      supplierUser {
        user {
          firstName
          lastName
          email
        }
        id
        enabled
        deleted
        role
      }
      employee {
        department
      }
    }
    ... on SupplierUserError {
      code
    }
  }
}`;

export const GET_SUPPLIER_EMPLOYEES = `query getSupplierEmployees($supBusId: UUID!) {
  getSupplierEmployees(supplierBusinessId: $supBusId) {
    ... on SupplierUserEmployeeGQL {
      supplierUser {
        id
        coreUserId
        user {
          firstName
          lastName
          email
          phoneNumber
        }
        enabled
        deleted
        role
      }
      permission {
        supplierBusinessId
        displaySalesSection
        displayRoutesSection
      }
      employee {
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

export const UPDATE_SUPPLIER_EMPLOYEE = `mutation updateSupplierEmployee($supUserId: UUID!, $firstName: String, $lastName: String, $phoneNumber: String, $department: String, $position: String, $supBusId: UUID!, $perms: [SupplierEmployeeInfoPermissionInput!]) {
  updateSupplierEmployee(
    supplierUserId: $supUserId
    lastName: $lastName
    name: $firstName
    phoneNumber: $phoneNumber
    department: $department
    position: $position
    supplierBusinessId: $supBusId
    displayPerms: {displaySalesSection: true, displayRoutesSection: true}
    permission: $perms
  ) {
    ... on SupplierUserEmployeeGQL {
      supplierUser {
        user {
          firstName
          lastName
          email
        }
        id
        enabled
        deleted
        role
      }
      employee {
        department
      }
    }
    ... on SupplierUserError {
      code
    }
  }
}`;

export const DELETE_SUPPLIER_EMPLOYEE = `mutation deleteRestaurantEmployee($supUserId: UUID!) {
  deleteSupplierUser(deleted: true, supplierUserId: $supUserId) {
    ... on SupplierUserStatus {
      deleted
    }
    ... on SupplierUserError {
      code
    }
  }
}`;
