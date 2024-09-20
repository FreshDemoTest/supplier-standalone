import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import mixpanel from 'mixpanel-browser';

// ----------------------------------------------------------------------

const mixtrack = (evName: string, evProps?: { [key: string]: any }) => {
  try {
    // mixpanel analytics
    mixpanel.track(evName, evProps);
  } catch (error) {
    console.warn('Issues logging Mixpanel Analytics Event:', error);
  }
};

const track = (
  evType: firebase.analytics.EventNameString,
  eventParams?: { [key: string]: any }
) => {
  if (process.env.NODE_ENV !== 'production') return;
  try {
    // firebase analytics
    firebase.analytics().logEvent(evType as string, eventParams);
    console.debug('FB GA event has been logged');
  } catch (error) {
    console.warn('Issues logging FB GA Analytics Event:', error);
  }
  // mixpanel analytics
  mixtrack(evType as string, eventParams);
};

export { mixtrack };
export default track;
