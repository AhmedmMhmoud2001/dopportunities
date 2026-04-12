import { Router } from 'express';

const router = Router();

let termsData = {
  id: 1,
  title: 'الشروط والأحكام',
  content: 'الشروط والأحكام\n\nمرحباً بك في منصتنا. يمكنك تعديل هذا النص من لوحة التحكم.',
  version: '1.0',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// GET /api/terms - returns active terms (public)
export async function getTerms(req, res) {
  try {
    return res.json(termsData);
  } catch (error) {
    console.error('Error fetching terms:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/admin/terms - update terms (admin only)
export async function updateTerms(req, res) {
  try {
    const { title, content, version } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    termsData = {
      ...termsData,
      title,
      content,
      version: version || termsData.version,
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    return res.json(termsData);
  } catch (error) {
    console.error('Error updating terms:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/admin/terms - get terms for admin (admin only)
export async function getAdminTerms(req, res) {
  try {
    return res.json(termsData);
  } catch (error) {
    console.error('Error fetching terms for admin:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default router;