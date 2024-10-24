import firebase from "firebase/compat/app";
import "firebase/compat/analytics";

// ----------------------------------------------------------------------

const track = (
  evType: firebase.analytics.EventNameString,
  eventParams?: { [key: string]: any }
) => {
  if (process.env.NODE_ENV !== "production") return;
  try {
    // firebase analytics
    firebase.analytics().logEvent(evType as string, eventParams);
    console.debug("FB GA event has been logged");
  } catch (error) {
    console.warn("Issues logging FB GA Analytics Event:", error);
  }
};

export default track;
