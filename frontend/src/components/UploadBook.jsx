import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

const UploadBook = ({ onBookSelect, books }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bookTitle, setBookTitle] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    // Set default title from filename without extension
    setBookTitle(file.name.replace('.pdf', ''));
    setUploadDialogOpen(true);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', bookTitle); // Send title to backend

    setUploading(true);
    setUploadProgress(0);
    setUploadDialogOpen(false);

    try {
      const response = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add auth if needed
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        console.log('Upload successful:', response.data.book);
        // Refresh books list or update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setBookTitle('');
    }
  };

  const handleCancelUpload = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setBookTitle('');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload or Choose a Book
      </Typography>

      {/* Upload Section */}
      <Box sx={{ mb: 3 }}>
        <input
          accept=".pdf"
          style={{ display: 'none' }}
          id="pdf-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor="pdf-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            Upload PDF
          </Button>
        </label>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCancelUpload}>
        <DialogTitle>Upload Book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Book Title"
            fullWidth
            variant="outlined"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Selected file: {selectedFile?.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload}>Cancel</Button>
          <Button onClick={handleFileUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Books List */}
      <Typography variant="h6" gutterBottom>
        Available Books
      </Typography>
      <List>
        {books.map((book) => (
          <ListItem
            key={book._id}
            button
            onClick={() => onBookSelect(book)}
            sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}
          >
            <Description sx={{ mr: 2, color: 'primary.main' }} />
            <ListItemText
              primary={book.title}
              secondary={`Uploaded: ${new Date(book.uploadDate).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UploadBook;