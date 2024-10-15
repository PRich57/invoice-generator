import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const KeybindGuide = () => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Tooltip title="Show Keybind Guide">
        <IconButton
          onClick={handleToggle}
          aria-label="toggle keybind guide"
          size="small"
          sx={{ p: 0 }}
        >
          {open ? <ExpandLessIcon /> : <InfoIcon />}
        </IconButton>
      </Tooltip>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, pl: 3 }}>
          <Typography
            variant="caption"
            color="secondary"
            component="div"
            sx={{ lineHeight: 1.5, fontSize: 13.5 }}
          >
            <strong>Invoice Items Quick Navigation:</strong>
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
                  paddingTop: 1,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Ctrl+Space</strong>: Indent or outdent items (convert items to subitems and vice versa).
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
                        <strong>**Note:</strong> This shortcut doesn't work on the topmost item as subitems can only exist beneath a parent item.
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
                      <strong>Tab</strong>: Move focus to the next field.
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
                      <strong>Shift+Tab</strong>: Move focus to the previous field.
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
                      <strong>Enter</strong>: Add a new item or subitem depending on the current field in focus.
                    </>
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                sx={{
                  py: 0.5,
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <strong>Backspace</strong>: Delete an empty item or subitem.
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
                        <strong>**Note:</strong> This does not work if no other items exist.
                      </Typography>
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
