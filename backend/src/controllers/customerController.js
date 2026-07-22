import { customerService } from '../services/customerService.js';
import { asyncHandler, formatResponse } from '../utils/helpers.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, pageSize, search, status, customer_type } = req.query;
  const result = await customerService.list({
    page,
    pageSize,
    search,
    status,
    customerType: customer_type,
  });
  res.status(200).json(formatResponse(result.data, result.meta));
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.getById(req.params.id);
  res.status(200).json(formatResponse(customer));
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body, req.user.id);
  res.status(201).json(formatResponse(customer));
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.update(req.params.id, req.body);
  res.status(200).json(formatResponse(customer));
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.remove(req.params.id);
  res.status(200).json(formatResponse({ id: req.params.id }));
});

export const addFollowUpNote = asyncHandler(async (req, res) => {
  const { note, follow_up_date } = req.body;
  const result = await customerService.addFollowUpNote(req.params.id, note, follow_up_date, req.user.id);
  res.status(201).json(formatResponse(result));
});

export const getFollowUpNotes = asyncHandler(async (req, res) => {
  const notes = await customerService.getFollowUpNotes(req.params.id);
  res.status(200).json(formatResponse(notes));
});
