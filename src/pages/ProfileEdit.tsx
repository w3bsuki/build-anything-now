import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { ProfileEditDrawer } from '@/components/profile/ProfileEditDrawer';
import { api } from '../../convex/_generated/api';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.me);
  const [open, setOpen] = useState(true);

  return (
    <ProfileEditDrawer
      open={open}
      currentUser={currentUser}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          navigate(-1);
        }
      }}
    />
  );
};

export default ProfileEdit;
