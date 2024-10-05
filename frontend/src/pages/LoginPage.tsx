import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box, Stack } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/validationHelpers';
import { useSnackbar } from 'notistack';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
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
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            // Error is handled in AuthContext
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ p: { xs: 2, md: 3 } }}>
            <Box
                sx={{
                    marginTop: { xs: 4, md: 8 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    Sign in
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: { xs: 1, md: 2 } }}
                    >
                        Sign In
                    </Button>
                    <Stack direction="row" justifyContent="center">
                        <Typography sx={{ marginRight: '4px' }}>
                            Don't have an account?
                        </Typography>
                        <Link to="/register" style={{ textDecoration: 'none', color: '#b68efe' }}>
                            Sign Up
                        </Link>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;