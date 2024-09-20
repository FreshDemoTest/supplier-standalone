# Alima Supply - Navigation

## Paths and Routes

To manage navigation in the application are implemented with lazy loads and a route builder. 

For the path declarations you can review them in [src/routes/paths.ts](../../src/routes/paths.ts); and each route import has to be declared in the `appRoutes` array within [src/routes/index.ts](../../src/routes/index.tsx).

## Auth Verification and Onboarding Rerouting

All the pages (with the exception of Login and Registration), are "guarded" by a component calles `<AuthGuard />`. 

This [`AuthGuard`](../../src/guards/AuthGuard.tsx) makes several validations to guarantee the user logged in is in an account fully onboarded. And in case it is not, it redirects to onboarding. 

AuthGuard verifies the following:

 - If user is not Authenticated --> it redirects to Login Page.
 - Else:
   - If user is not Verified --> it redirectos to Verification (SMS / Email).
   - Else:
     -  If Permissions are correctly loaded: 
       - If Business data is loaded and business data is empty and path is not `/app/onboarding` --> Redirects to Onboarding
       - Else: 
         - If `allowed` is loaded and accountPermission is False:
           - If path is not in [`/app/account-deleted`, `/app/alima-suscription`, `/app/onboarding`]:
             - --> Redirect to account deleted page
         - Else: 
           - --> Render requested Page 

### Onboarding validation

When the onboarding page is loaded, all the validations that happen to consider an onboarding of a new account to be finished are the following.

1. Onboarding step starts with `ONBOARDING_STEPS.BUSINESS_ACCOUNT` in which businessType is empty.
2. Then, at load time, within the `useEffect` it starts verifying.
3. Once the business is Filled and Number of Units === 0 --> sets `ONBOARDING_STEPS.SUPPLIER_UNIT`
4. If all the previous are set, but Plan (alimaAccount.account) is not created --> sets `ONBOARDING_STEPS.PLAN_SELECTION`
5. If all the previous are set, --> sets `ONBOARDING_STEPS.PAYMENT_METHOD`
6. If all the previous are set, and there is a Payment Card / Transfer Account and RFC --> sets `ONBOARDING_STEPS.DONE`

All this verifications are dynamicaly validated as onboarding process is filled. If all the above are covered, a pop-up shows up and it redirects back to the Home.


## Permissions

For the application there are 2 layers in which they are accessed and modified.

The acccess layer (which is the one it is used across the different pages and components) is the [`usePermissions`](../../src/hooks/usePermissions.ts) hook which ensures to fetch the permissions once, and it returns both a flag to know if the permissions are loaded (`loaded`) and the data correspondent to the permissions of the user (`allowed`).

The 2nd layer, the data layer, is located as a redux slice in [src/redux/slices/permission.ts](../../src/redux/slices/permission.ts). The `getPermissions` method is called from the `usePermissions` hook to retrieve from the backend what are the permissions and format them for usage in the app.

Currently the backend stores compacted versions of permissiones, that represent multiple permissions from onlly one key. For example, `'ordenes-all'` involves all these sections: `['ordenes-view-details', 'ordenes-view-list', 'ordenes-add', 'ordenes-edit', 'ordenes-delete']`. And the way the redux slice expands such permissions, is through the `validatePermissions` and `setExpandedPermissions` methods. 

Finally, the app verifies which permissions are allowed through the `allowed` object at the Page level, before rendering the Page contents; and it redirects generally back to `/app/orden/list` when the user doesn't have access to such Page.


