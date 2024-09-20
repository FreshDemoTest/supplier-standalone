// hooks
import useAuth from '../hooks/useAuth';
//

import createAvatar from '../utils/createAvatar';
import MAvatar from './extensions/MAvatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { user } = useAuth();

  if (user === null) {
    return (
        <MAvatar >
            {createAvatar('NULL').name}
        </MAvatar>
    )
  }

  return (
    <MAvatar
      src={user.photoURL || ''}
      alt={user.displayName}
      color={user.photoURL ? 'default' : (createAvatar(user.displayName || 'NULL').color as string)}
      {...other}
    >
      {createAvatar(user.displayName).name}
    </MAvatar>
  );
}
