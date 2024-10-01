import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box } from '@mui/material';
import { register } from '../services/api/auth';
import { useSnackbar } from 'notistack';
import { isValidEmail } from '../utils/validationHelpers';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            enqueueSnackbar('Invalid email format', { variant: 'error' });
            return;
        }
        if (!password) {
            enqueueSnackbar('Password is required', { variant: 'error' });
            return;
        }
        try {
            await register(email, password);
            enqueueSnackbar('Registration successful. Please log in.', { variant: 'success' });
            navigate('/login');
        } catch (err) {
            enqueueSnackbar('Registration failed. Please try again.', { variant: 'error' });
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Create Account
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Register;