import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MobileResponsiveTooltip from '../../common/MobileResponsiveTooltip';

const KeybindGuide = () => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ mt: 0, ml: 1 }}>
      <MobileResponsiveTooltip title="Keybind Guide" placement='right' arrow>
        <IconButton
          onClick={handleToggle}
          aria-label="toggle keybind guide"
          size="small"
          sx={{ p: 0, opacity: '50%' }}
        >
          {open ? <ExpandLessIcon /> : <InfoIcon fontSize='small'/>}
        </IconButton>
      </MobileResponsiveTooltip>
      
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, pl: 0 }}>
          <Typography
            variant="caption"
            component="div"
            sx={{ lineHeight: 1.5, fontSize: 13.5 }}
          >
            <List
              dense
              disablePadding
              sx={{
                mt: 0
              }}
            >
              <ListItem
                disableGutters
                sx={{
                  py: 0,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Enter</strong>: Add a new Item or Subitem.
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                        sx={{
                          display: 'block',
                          ml: 4,
                          mt: 0
                        }}
                      >
                        **Item or Subitem is determined by the current field in focus**
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                sx={{
                  py: 0,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Backspace</strong>: Delete an empty item or subitem field.
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                        sx={{
                          display: 'block',
                          ml: 4,
                          mt: 0
                        }}
                      >
                        **This does not work if no other items exist**
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                sx={{
                  py: 0,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Ctrl+Space</strong>: Convert items to subitems and vice versa.
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                        sx={{
                          display: 'block',
                          ml: 4,
                          mt: 0,
                          mb: 0
                        }}
                      >
                        **This shortcut doesn't work on the topmost item as subitems can only exist beneath a parent item**
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                sx={{
                  py: 0,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Arrow Keys</strong>: Navigate between fields.
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                        sx={{
                          display: 'block',
                          ml: 4,
                          mt: 0
                        }}
                      >
                        **<strong>Tab</strong> and <strong>Shift+Tab</strong> work as well**
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                sx={{
                  py: 0,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Drag & Drop</strong>: Rearrange items and subitems with the icon to the left of each field.
                    </>
                  }
                />
              </ListItem>
            </List>
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default KeybindGuide;