import { Typography } from '@mui/material';
import { useUser } from '../context/AuthContext';

export default function Home() {
  const { user } = useUser();
  console.log(user);
  return (
    <Typography variant="h1" color="black">
      Hello world!
    </Typography>
  );
}
