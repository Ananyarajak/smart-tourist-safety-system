const EmergencyContact = require('../models/EmergencyContact');
const { validateIndianPhone, formatIndianPhone } = require('../utils/phoneUtils');

// @desc    Get all emergency contacts for logged-in user
// @route   GET /api/contacts
// @access  Private (Tourist)
exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user.id }).sort({ isPrimary: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new emergency contact
// @route   POST /api/contacts
// @access  Private (Tourist)
exports.createContact = async (req, res, next) => {
  try {
    const { name, phone, relationship, email, isPrimary } = req.body;

    if (!name || !phone || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and relationship are required.',
      });
    }

    if (!validateIndianPhone(phone, true)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian contact number (10-digit mobile number with or without +91 prefix, or standard helpline).',
      });
    }

    const formattedPhone = formatIndianPhone(phone);

    // If marked as primary, unmark previous primary contacts
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { user: req.user.id },
        { $set: { isPrimary: false } }
      );
    }

    const contact = await EmergencyContact.create({
      user: req.user.id,
      name,
      phone: formattedPhone,
      relationship,
      email: email || '',
      isPrimary: Boolean(isPrimary),
    });

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      contact,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update emergency contact
// @route   PUT /api/contacts/:id
// @access  Private (Tourist)
exports.updateContact = async (req, res, next) => {
  try {
    const { name, phone, relationship, email, isPrimary } = req.body;

    let contact = await EmergencyContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Ensure user owns this contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this contact' });
    }

    if (phone) {
      if (!validateIndianPhone(phone, true)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid Indian contact number (10-digit mobile number with or without +91 prefix, or standard helpline).',
        });
      }
    }

    if (isPrimary) {
      await EmergencyContact.updateMany(
        { user: req.user.id, _id: { $ne: req.params.id } },
        { $set: { isPrimary: false } }
      );
    }

    contact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: name || contact.name,
          phone: phone ? formatIndianPhone(phone) : contact.phone,
          relationship: relationship || contact.relationship,
          email: email !== undefined ? email : contact.email,
          isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : contact.isPrimary,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      contact,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private (Tourist)
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (contact.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this contact' });
    }

    await EmergencyContact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
