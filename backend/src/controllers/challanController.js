import { challanService } from '../services/challanService.js';
import { asyncHandler, formatResponse } from '../utils/helpers.js';

export const listChallans = asyncHandler(async (req, res) => {
  const { page, pageSize, search, status } = req.query;
  const result = await challanService.list({ page, pageSize, search, status });
  res.status(200).json(formatResponse(result.data, result.meta));
});

export const getChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.getById(req.params.id);
  res.status(200).json(formatResponse(challan));
});

export const createChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.create(req.body, req.user.id);
  res.status(201).json(formatResponse(challan));
});

export const updateChallanStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const challan = await challanService.updateStatus(req.params.id, status, req.user.id);
  res.status(200).json(formatResponse(challan));
});
