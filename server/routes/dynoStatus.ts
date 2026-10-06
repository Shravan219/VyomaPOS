import { Router, Request, Response } from 'express';
import dynoHandler from './dynoHandler';
import { handleDynoStatusUpdate } from '../../lib/dyno-inbound-status';

const router = Router();

// Dyno-spec alias: POST /orders  (Dyno cloud posts to root /orders)
// Delegates to the canonical Dyno handler so the response schema is identical:
//   [{"status":200,"orderId":"<id>","message":"Order No. <id> Inserted Successfully"}]
router.post(['/', ''], async (req: Request, res: Response) => {
  try {
    return await dynoHandler(req, res);
  } catch (err: any) {
    return res.status(500).json([{ status: 500, orderId: 'ERROR', message: err?.message || 'Internal error' }]);
  }
});

router.get(['/', ''], (_req: Request, res: Response) => {
  return res.status(200).json({ status: 200, message: 'Dyno orders endpoint active' });
});

// Dyno-spec: POST /orders/{orderId}/status
//   Request:  {"statusCode": 1, "statusResponse": {}}
//   Response: {"status": 2, "message": "Updated the status to 2 for order Id <id>"}
//   Mapping:  1->2 (Accepted), 3->4 (Ready); others per DYNO_STATUS_CODE_MAP.
router.post('/:orderId/status', (req: Request, res: Response) => {
  try {
    const result = handleDynoStatusUpdate(req.params.orderId, req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    const httpStatus = err?.httpStatus === 422 ? 422 : 500;
    return res.status(httpStatus).json({ status: httpStatus, message: err?.message || 'Internal error' });
  }
});

export default router;
