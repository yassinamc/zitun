const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  millName: z.string().min(2),
  millSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  city: z.string().optional(),
  phone: z.string().optional(),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const customerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  cin: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const receptionSchema = z.object({
  customerId: z.string().uuid(),
  grossWeightKg: z.number().positive(),
  tareWeightKg: z.number().nonnegative(),
  transportType: z.enum(['CUSTOMER', 'COMPANY']),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'CREDIT']).optional(),
  notes: z.string().optional().nullable(),
});

const pricingSchema = z.object({
  customerTransportRate: z.number().positive(),
  companyTransportRate: z.number().positive(),
});

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: parsed.error.flatten(),
      });
    }
    req.body = parsed.data;
    return next();
  };
}

module.exports = {
  loginSchema,
  registerSchema,
  customerSchema,
  receptionSchema,
  pricingSchema,
  validate,
};
