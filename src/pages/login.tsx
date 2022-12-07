import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import { useForm } from 'react-hook-form';
import { Button, Grid, TextField } from '@material-ui/core';
import { Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useUser } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface IFormInput {
  username: string;
  password: string;
}

export default function Login() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [signInError, setSignInError] = useState<string>('');

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: IFormInput) => {
    const { username, password } = data;
    try {
      const loggedInUser = await Auth.signIn(username, password);
      if (loggedInUser) {
        router.push('/');
      } else {
        throw new Error('Something went wrong');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        style={{ marginTop: 20 }}
      >
        <Grid item>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            type="text"
            error={errors.username ? true : false}
            helperText={errors.username ? errors.username?.message : null}
            {...register('username', {
              required: { value: true, message: 'Please enter a username.' },
            })}
          />
        </Grid>

        <Grid item>
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            type="password"
            error={errors.password ? true : false}
            helperText={errors.password ? errors.password?.message : null}
            {...register('password', {
              required: { value: true, message: 'Please enter a password.' },
              minLength: {
                value: 8,
                message: 'Please enter a stronger password.',
              },
            })}
          />
        </Grid>

        <Grid item>
          <Button variant="contained" type="submit">
            Login
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {signInError}
        </Alert>
      </Snackbar>
    </form>
  );
}
