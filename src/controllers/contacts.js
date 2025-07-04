import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from "../services/contacts.js";
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    userId: req.user._id, 
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId, req.user._id); 

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const { name, phoneNumber, contactType, email, isFavourite } = req.body;
  const file = req.file;

  if (!name || !phoneNumber || !contactType) {
    throw createHttpError(400, 'Missing required fields: name, phoneNumber, contactType');
  }

  let photo = '';
  if (file) {
    photo = await saveFileToCloudinary(file);
  }

  const contact = await createContact({
    name,
    phoneNumber,
    contactType,
    email,
    isFavourite,
    userId: req.user._id,
    photo, 
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const patchContactController = async (req, res) => {
  const { contactId } = req.params;
  const file = req.file;

  let updatedData = { ...req.body };

  if (file) {
    const photo = await saveFileToCloudinary(file);
    updatedData.photo = photo;
  }

  const result = await updateContact(contactId, updatedData, req.user._id);

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  const result = await deleteContact(contactId, req.user._id); 
  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
