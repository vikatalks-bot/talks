const express = require('express');
const router = express.Router();
const LessonRequest = require('../models/LessonRequest');
const Lesson = require('../models/Lesson');
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST /api/lesson-requests
// @desc    Create lesson booking request
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { lessonId, requestedDate, requestedTime, message } = req.body;

    if (!lessonId || !requestedDate || !requestedTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if date is in the future
    const requestDate = new Date(requestedDate);
    if (requestDate < new Date()) {
      return res.status(400).json({ message: 'Cannot book past dates' });
    }

    const request = await LessonRequest.create({
      userId: req.user._id,
      lessonId,
      requestedDate: requestDate,
      requestedTime,
      message: message || '',
      status: 'pending'
    });

    const populatedRequest = await LessonRequest.findById(request._id)
      .populate('lessonId')
      .populate('userId', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lesson-requests/my-requests
// @desc    Get user's lesson requests
// @access  Private
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await LessonRequest.find({ userId: req.user._id })
      .populate('lessonId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lesson-requests/pending
// @desc    Get all pending requests (admin/teacher)
// @access  Private/Admin
router.get('/pending', [auth, admin], async (req, res) => {
  try {
    const requests = await LessonRequest.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('lessonId')
      .sort({ requestedDate: 1 });
    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lesson-requests
// @desc    Get all requests (admin)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const requests = await LessonRequest.find(query)
      .populate('userId', 'name email')
      .populate('lessonId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lesson-requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await LessonRequest.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('lessonId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns the request or is admin
    if (request.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lesson-requests/:id/approve
// @desc    Approve request
// @access  Private/Admin
router.put('/:id/approve', [auth, admin], async (req, res) => {
  try {
    const { teacherResponse } = req.body;
    const request = await LessonRequest.findById(req.params.id)
      .populate('lessonId')
      .populate('userId');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'approved';
    if (teacherResponse) {
      request.teacherResponse = teacherResponse;
    }
    await request.save();

    res.json({ message: 'Request approved', request });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lesson-requests/:id/reject
// @desc    Reject request
// @access  Private/Admin
router.put('/:id/reject', [auth, admin], async (req, res) => {
  try {
    const { teacherResponse } = req.body;
    const request = await LessonRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'rejected';
    if (teacherResponse) {
      request.teacherResponse = teacherResponse;
    }
    await request.save();

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lesson-requests/:id/cancel
// @desc    Cancel request (user)
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await LessonRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled', request });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

