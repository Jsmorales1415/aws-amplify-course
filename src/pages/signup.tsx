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
  email: string;
  password: string;
  code: string;
}

export default function SignUp() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [signUpError, setSignUpError] = useState<string>('');
  const [showCode, setShowCode] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      code: '',
    },
  });

  const onSubmit = async (data: IFormInput) => {
    try {
      if (showCode) {
        confirmSignUp(data);
      } else {
        console.log({ data });
        await signUpWithEmailAndPassword(data);
        setShowCode(true);
      }
    } catch (err) {
      console.error(err);
      setSignUpError('Error on submit');
      setOpenSnackbar(true);
    }
  };

  const signUpWithEmailAndPassword = async (
    data: IFormInput
  ): Promise<CognitoUser> => {
    const { username, password, email } = data;
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
        autoSignIn: {
          enabled: true,
        },
      });
      console.log('Signed up user: ', user);
      return user;
    } catch (error) {
      throw error;
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

  async function confirmSignUp(data: IFormInput) {
    const { username, password, code } = data;
    try {
      await Auth.confirmSignUp(username, code);
      const loggedInUser = await Auth.signIn(username, password);
      if (loggedInUser) {
        router.push('/');
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      console.log('error confirming sign up', error);
    }
  }

  console.log('Logged in user from hook: ', user);

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
              // minLength: {
              //   value: 3,
              //   message: 'Please enter a username between 3-16 characters.',
              // },
              // maxLength: {
              //   value: 16,
              //   message: 'Please enter a username between 3-16 characters.',
              // },
            })}
          />
        </Grid>
        <Grid item>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            type="email"
            error={errors.email ? true : false}
            helperText={errors.email ? errors.email?.message : null}
            {...register('email', {
              required: { value: true, message: 'Please enter a email.' },
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

        {showCode && (
          <Grid item>
            <TextField
              id="code"
              label="Verification Code"
              variant="outlined"
              type="text"
              error={errors.code ? true : false}
              helperText={errors.code ? errors.code?.message : null}
              {...register('code', {
                required: { value: true, message: 'Please enter a code.' },
              })}
            />
          </Grid>
        )}

        <Grid item>
          <Button variant="contained" type="submit">
            {showCode ? 'Confirm Code' : 'Sign Up'}
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {signUpError}
        </Alert>
      </Snackbar>
    </form>
  );
}
