require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const admin = require('firebase-admin');

// Initialize Express
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));


const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


let oAuth2Client;
let drive;

try {
  const credentials = JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS);

  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;

  oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (process.env.GOOGLE_TOKEN) {
    const token = JSON.parse(process.env.GOOGLE_TOKEN);
    oAuth2Client.setCredentials(token);

    drive = google.drive({
      version: 'v3',
      auth: oAuth2Client,
    });

    console.log('✓ OAuth2 authenticated successfully');
  } else {
    console.log('⚠ No token found in ENV');
  }
} catch (error) {
  console.error('⚠ OAuth ENV not configured properly:', error);
}

// Google Drive folder IDs
const DRIVE_FOLDERS = {
  '10th': process.env.DRIVE_10TH_FOLDER_ID,
  '11th': process.env.DRIVE_11TH_FOLDER_ID,
  '12th': process.env.DRIVE_12TH_FOLDER_ID,
};

// ========== AUTHENTICATION MIDDLEWARE ==========

// Middleware to verify admin session
const verifyAdmin = async (req, res, next) => {
  try {
    const adminEmail = req.headers.adminemail;
    
    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No admin email provided',
      });
    }

    // Verify admin exists in database
    const authSnapshot = await db.collection('authorized-persons')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (authSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid admin',
      });
    }

    // Add admin data to request
    req.admin = {
      id: authSnapshot.docs[0].id,
      ...authSnapshot.docs[0].data()
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// OAuth endpoints (for one-time setup)
app.get('/api/get-auth-url', (req, res) => {
  if (!oAuth2Client) {
    return res.status(500).json({ error: 'OAuth client not initialized' });
  }
  
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  
  res.json({ 
    authUrl,
    instructions: 'Visit this URL, authorize the app, and copy the code from the redirect URL'
  });
});

app.get('/api/oauth-callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log('⚠ Save this token in your ENV as GOOGLE_TOKEN:');
    console.log(JSON.stringify(tokens));    

    // Initialize drive after successful auth
    drive = google.drive({ version: 'v3', auth: oAuth2Client });
    
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: green;">✓ Authentication successful!</h1>
          <p>You can close this window and restart your server.</p>
          <p>The token has been saved to token.json</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

// Helper function to upload to Google Drive
async function uploadToDrive(pdfBuffer, fileName, standard) {
  if (!drive) {
    throw new Error('Google Drive not authenticated. Please run OAuth setup first.');
  }

  const folderId = DRIVE_FOLDERS[standard];
  
  if (!folderId) {
    throw new Error(`No folder ID configured for standard: ${standard}`);
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: 'application/pdf',
    body: require('stream').Readable.from(pdfBuffer),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    };
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw new Error(`Failed to upload to Google Drive: ${error.message}`);
  }
}

// Helper function to save to Firebase
async function saveToFirebase(formData, driveFileInfo) {
  try {
    const docData = {
      studentName: formData.studentName,
      studentEmail: formData.email,
      studentDOB: formData.dob,
      studentPhoto: formData.photo,
      driveFileId: driveFileInfo.fileId,
      driveFileLink: driveFileInfo.webViewLink,
      standard: formData.std,
      gender: formData.gender,
      board: formData.board,
      school: formData.school,
      subjects: {
        maths: formData.subjectMaths || false,
        science: formData.subjectScience || false,
        physics: formData.subjectPhysics || false,
        chemistry: formData.subjectChemistry || false,
      },
      fatherName: formData.fatherName,
      fatherOccupation: formData.fatherOccupation || '',
      motherName: formData.motherName,
      motherOccupation: formData.motherOccupation || '',
      address: formData.address,
      cellNo: formData.cellNo,
      cellNo2: formData.cellNo2 || '',
      whatsappNo: formData.whatsappNo || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('application-docs').add(docData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw new Error(`Failed to save to Firebase: ${error.message}`);
  }
}

// Helper function to get files from Drive folder
async function getFilesFromFolder(folderId) {
  if (!drive) {
    throw new Error('Google Drive not authenticated');
  }

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and mimeType='application/pdf'`,
      fields: 'files(id, name, webViewLink, createdTime, size)',
      orderBy: 'createdTime desc',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching files from Drive:', error);
    throw new Error(`Failed to fetch files: ${error.message}`);
  }
}

// Helper function to enrich Drive files with board info from Firestore
async function enrichFilesWithBoard(files) {
  if (files.length === 0) return files;

  const boardByFileId = {};
  const driveFileIds = files.map(f => f.id);
  const batchSize = 30;

  for (let i = 0; i < driveFileIds.length; i += batchSize) {
    const batch = driveFileIds.slice(i, i + batchSize);
    const snapshot = await db.collection('application-docs')
      .where('driveFileId', 'in', batch)
      .get();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.driveFileId) {
        boardByFileId[data.driveFileId] = data.board || null;
      }
    });
  }

  return files.map(file => ({
    ...file,
    board: boardByFileId[file.id] || null,
  }));
}

// Main submission endpoint - receives PDF from frontend
app.post('/api/submit-application', async (req, res) => {
  try {
    const { pdfBase64, ...formData } = req.body;

    // Validate required fields
    if (!formData.studentName || !formData.std || !formData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (!pdfBase64) {
      return res.status(400).json({
        success: false,
        error: 'PDF data is missing',
      });
    }

    // Convert base64 to buffer
    console.log('Processing PDF...');
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Create file name
    const emailPrefix = formData.email.split('@')[0];
    const fileName = `${formData.studentName.replace(/\s+/g, '_')}_${formData.std}_${emailPrefix}.pdf`;

    // Upload to Google Drive
    console.log('Uploading to Google Drive...');
    const driveFileInfo = await uploadToDrive(pdfBuffer, fileName, formData.std);

    // Save to Firebase
    console.log('Saving to Firebase...');
    const firestoreDocId = await saveToFirebase(formData, driveFileInfo);

    // Return success
    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        firestoreDocId,
        driveFileId: driveFileInfo.fileId,
        driveFileLink: driveFileInfo.webViewLink,
        fileName,
      },
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during submission',
    });
  }
});

// ========== ACADEMIC YEAR ROUTES ==========

// Get current academic year
app.get('/api/academic-year', async (req, res) => {
  try {
    const docRef = db.collection('academic-details').doc('current-year');
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({
        academicYear: '2026-27',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        success: true,
        academicYear: '2026-27',
      });
    }

    res.json({
      success: true,
      academicYear: doc.data().academicYear,
      updatedAt: doc.data().updatedAt,
    });
  } catch (error) {
    console.error('Error fetching academic year:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Set/Update academic year
app.post('/api/academic-year', async (req, res) => {
  try {
    const { academicYear } = req.body;

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        error: 'Academic year is required',
      });
    }

    const yearPattern = /^\d{4}-\d{2}$/;
    if (!yearPattern.test(academicYear)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use format: YYYY-YY (e.g., 2026-27)',
      });
    }

    const docRef = db.collection('academic-details').doc('current-year');
    await docRef.set({
      academicYear,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.json({
      success: true,
      message: 'Academic year updated successfully',
      academicYear,
    });
  } catch (error) {
    console.error('Error setting academic year:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========== DRIVE FILES ROUTES ==========

// Get all PDFs from all standards
app.get('/api/pdfs/all', async (req, res) => {
  try {
    const allFiles = [];
    const standards = ['10th', '11th', '12th'];

    for (const standard of standards) {
      const folderId = DRIVE_FOLDERS[standard];
      if (folderId) {
        const files = await getFilesFromFolder(folderId);
        allFiles.push(...files.map(file => ({ ...file, standard })));
      }
    }

    const enrichedFiles = await enrichFilesWithBoard(allFiles);

    res.json({
      success: true,
      count: enrichedFiles.length,
      files: enrichedFiles,
      breakdown: {
        '10th': enrichedFiles.filter(f => f.standard === '10th').length,
        '11th': enrichedFiles.filter(f => f.standard === '11th').length,
        '12th': enrichedFiles.filter(f => f.standard === '12th').length,
      },
    });
  } catch (error) {
    console.error('Error fetching all PDFs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get PDFs from 10th standard
app.get('/api/pdfs/10th', async (req, res) => {
  try {
    const folderId = DRIVE_FOLDERS['10th'];
    if (!folderId) {
      return res.status(400).json({ success: false, error: 'Folder ID not configured for 10th standard' });
    }
    const files = await getFilesFromFolder(folderId);
    const enrichedFiles = await enrichFilesWithBoard(files);
    res.json({ success: true, standard: '10th', count: enrichedFiles.length, files: enrichedFiles });
  } catch (error) {
    console.error('Error fetching 10th PDFs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get PDFs from 11th standard
app.get('/api/pdfs/11th', async (req, res) => {
  try {
    const folderId = DRIVE_FOLDERS['11th'];
    if (!folderId) {
      return res.status(400).json({ success: false, error: 'Folder ID not configured for 11th standard' });
    }
    const files = await getFilesFromFolder(folderId);
    const enrichedFiles = await enrichFilesWithBoard(files);
    res.json({ success: true, standard: '11th', count: enrichedFiles.length, files: enrichedFiles });
  } catch (error) {
    console.error('Error fetching 11th PDFs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get PDFs from 12th standard
app.get('/api/pdfs/12th', async (req, res) => {
  try {
    const folderId = DRIVE_FOLDERS['12th'];
    if (!folderId) {
      return res.status(400).json({ success: false, error: 'Folder ID not configured for 12th standard' });
    }
    const files = await getFilesFromFolder(folderId);
    const enrichedFiles = await enrichFilesWithBoard(files);
    res.json({ success: true, standard: '12th', count: enrichedFiles.length, files: enrichedFiles });
  } catch (error) {
    console.error('Error fetching 12th PDFs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== TOP PERFORMERS ROUTES ==========

// Get all top performers (public - used by frontend)
app.get('/api/top-performers', async (req, res) => {
  try {
    const snapshot = await db.collection('top-performers')
      .orderBy('createdAt', 'desc')
      .get();

    const performers = [];
    snapshot.forEach(doc => {
      performers.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, performers });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a top performer - Protected route
app.post('/api/top-performers', verifyAdmin, async (req, res) => {
  try {
    const { std, name, school, year, maths, science, physics, chemistry, total } = req.body;

    if (!std || !name || !school || !year || !total) {
      return res.status(400).json({
        success: false,
        error: 'std, name, school, year, and total are required',
      });
    }

    if (!['10th', '11th', '12th'].includes(std)) {
      return res.status(400).json({ success: false, error: 'Invalid standard' });
    }

    const docData = {
      std,
      name: name.trim(),
      school: school.trim(),
      year: year.trim(),
      total: total.trim(),
      maths: maths ? maths.trim() : '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.admin.email,
    };

    if (std === '10th') {
      docData.science = science ? science.trim() : '';
    } else {
      docData.physics = physics ? physics.trim() : '';
      docData.chemistry = chemistry ? chemistry.trim() : '';
    }

    const docRef = await db.collection('top-performers').add(docData);

    res.json({
      success: true,
      message: 'Top performer added successfully',
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error adding top performer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a top performer - Protected route
app.delete('/api/top-performers/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID is required' });
    }

    const docRef = db.collection('top-performers').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Performer not found' });
    }

    await docRef.delete();

    res.json({ success: true, message: 'Top performer deleted successfully' });
  } catch (error) {
    console.error('Error deleting top performer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== AUTHENTICATION ROUTES ==========

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const authSnapshot = await db.collection('authorized-persons')
      .where('email', '==', email)
      .where('password', '==', password)
      .limit(1)
      .get();

    if (authSnapshot.empty) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const adminDoc = authSnapshot.docs[0];
    const adminData = adminDoc.data();

    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: adminDoc.id,
        email: adminData.email,
        name: adminData.name || 'Admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify admin session
app.post('/api/admin/verify', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const authSnapshot = await db.collection('authorized-persons')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (authSnapshot.empty) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, message: 'Session valid' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== USER MANAGEMENT ROUTES (Protected) ==========

// Register new admin/user - Protected route
app.post('/api/admin/register', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await db.collection('authorized-persons')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(409).json({ success: false, error: 'User with this email already exists' });
    }

    const newUser = {
      name: name || '',
      email: email,
      password: password,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.admin.email,
    };

    const docRef = await db.collection('authorized-persons').add(newUser);

    res.json({
      success: true,
      message: 'User registered successfully',
      user: { id: docRef.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all registered users - Protected route
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('authorized-persons').get();

    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.name || '',
        email: userData.email,
        createdAt: userData.createdAt,
        createdBy: userData.createdBy || 'N/A',
      });
    });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user - Protected route
app.delete('/api/admin/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    if (userId === req.admin.id) {
      return res.status(403).json({ success: false, error: 'Cannot delete your own account' });
    }

    const userDoc = await db.collection('authorized-persons').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await db.collection('authorized-persons').doc(userId).delete();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user - Protected route
app.put('/api/admin/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const userDoc = await db.collection('authorized-persons').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.admin.email,
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
      }

      const existingEmail = await db.collection('authorized-persons')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingEmail.empty && existingEmail.docs[0].id !== userId) {
        return res.status(409).json({ success: false, error: 'Email already in use by another user' });
      }

      updateData.email = email;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
      }
      updateData.password = password;
    }

    await db.collection('authorized-persons').doc(userId).update(updateData);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});