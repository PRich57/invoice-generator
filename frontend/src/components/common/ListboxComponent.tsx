import React from 'react';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';

interface ListboxProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
}

const StyledList = styled(List)(({ theme }) => ({
    paddingBottom: theme.spacing(4), // Space for the logo
}));

const ListboxComponent = React.forwardRef<HTMLUListElement, ListboxProps>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;

    return (
        <StyledList {...other} ref={ref}>
            {children}
            <ListItem disablePadding>
                <Box sx={{ width: '100%', justifyContent: 'right', pr: '14px', display: 'flex' }}>
                    <span style={{ paddingRight: '6px', paddingTop: '3px' }}>
                        Powered by
                    </span>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                        <img
                            src="/assets/google_on_non_white_hdpi.png"
                            alt="Powered by Google"
                            style={{ height: '25px', paddingTop: '4px' }}
                        />
                    </a>
                </Box>
            </ListItem>
        </StyledList>
    );
});

export default ListboxComponent;