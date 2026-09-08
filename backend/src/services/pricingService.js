const CUSTOMER_RATE = 0.5;
const COMPANY_RATE = 0.65;

function calculateNetWeight(grossKg, tareKg) {
  const gross = Number(grossKg);
  const tare = Number(tareKg);
  if (Number.isNaN(gross) || Number.isNaN(tare)) {
    throw new Error('Invalid weight values');
  }
  if (gross <= tare) {
    throw new Error('Gross weight must be greater than tare weight');
  }
  return Number((gross - tare).toFixed(2));
}

function getUnitPrice(transportType, pricing) {
  if (transportType === 'CUSTOMER') {
    return Number(pricing?.customer_transport_rate ?? CUSTOMER_RATE);
  }
  if (transportType === 'COMPANY') {
    return Number(pricing?.company_transport_rate ?? COMPANY_RATE);
  }
  throw new Error('Invalid transport type');
}

function calculateTotal(netKg, unitPrice) {
  return Number((Number(netKg) * Number(unitPrice)).toFixed(2));
}

function calculateYield(oilLiters, olivesNetKg) {
  const oil = Number(oilLiters);
  const olives = Number(olivesNetKg);
  if (olives <= 0) throw new Error('Olives net weight must be > 0');
  return Number(((oil / olives) * 100).toFixed(2));
}

module.exports = {
  CUSTOMER_RATE,
  COMPANY_RATE,
  calculateNetWeight,
  getUnitPrice,
  calculateTotal,
  calculateYield,
};
