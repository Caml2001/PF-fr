import apiClient from './axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaces para modelar los datos de préstamos que recibimos de la API
export interface ApiLoan {
  id: string;
  borrowerId: string;
  accountId: string;
  productId: string;
  principal: number;
  term: number;
  rateApplied: number;
  ratePeriodicity: string;
  status: string;
  createdAt: string;
  commissionAmount: number;
  startDate: string;
  expectedEndDate: string;
  payments?: ApiPayment[];
}

export interface ApiPayment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: string;
}

// Interfaces para la tabla de amortización
export interface ApiScheduleItem {
  paymentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  remainingBalance: number;
  status: string;
}

// Nueva interfaz para el formato actualizado de la tabla de amortización recibido de la API
export interface ApiScheduleItemV2 {
  id: number;
  loanId: string;
  periodIndex: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  feeDue: number;
  principalPaid: number;
  interestPaid: number;
  feePaid: number;
  paid: boolean;
  partiallyPaid: boolean;
  totalDue: number;
  totalPaid: number;
  remainingDue: number;
}

// Interfaces para nuestro modelo de datos interno
export interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface NextPayment {
  date: string;
  amount: number;
  status: 'pending' | 'paid';
}

export interface ScheduleItem {
  paymentNumber: number;
  date: string;
  principal: number;
  interest: number;
  total: number;
  remainingBalance: number;
  status: 'paid' | 'pending';
}

export interface Loan {
  id: string;
  amount: number;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  term: number;
  interestRate: number;
  nextPayment?: NextPayment;
  payments: Payment[];
  commissionAmount: number;
  scheduleItems?: ScheduleItem[];
  details?: {
    productName?: string;
    accountNumber?: string;
    totalInterest?: number;
    totalAmount?: number;
  };
}

// Función para formatear fechas en español
const formatDateToSpanish = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'd MMM yyyy', { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
};

// Función para mapear el estado de un préstamo
const mapLoanStatus = (apiStatus: string): 'active' | 'completed' | 'pending' => {
  switch (apiStatus) {
    case 'ACTIVE':
      return 'active';
    case 'COMPLETED':
      return 'completed';
    case 'PENDING_APPROVAL':
    default:
      return 'pending';
  }
};

// Función para mapear el estado de un pago
const mapPaymentStatus = (apiStatus: string): 'paid' | 'pending' => {
  return apiStatus === 'PAID' ? 'paid' : 'pending';
};

// Función para transformar los datos del nuevo formato de tabla de amortización
const transformScheduleItemV2 = (apiItem: ApiScheduleItemV2): ScheduleItem => {
  return {
    paymentNumber: apiItem.periodIndex + 1, // Ajustamos el índice para mostrar desde 1
    date: formatDateToSpanish(apiItem.dueDate),
    // Asegurarnos de que todos los valores numéricos tengan un valor por defecto de 0 si son nulos o indefinidos
    principal: apiItem.principalDue || 0,
    interest: apiItem.interestDue || 0,
    total: apiItem.totalDue || 0,
    remainingBalance: apiItem.remainingDue || 0,
    status: apiItem.paid ? 'paid' : 'pending'
  };
};

// Función para transformar un item de la tabla de amortización
const transformScheduleItem = (apiItem: ApiScheduleItem): ScheduleItem => {
  return {
    paymentNumber: apiItem.paymentNumber,
    date: formatDateToSpanish(apiItem.dueDate),
    // Asegurarnos de que todos los valores numéricos tengan un valor por defecto de 0 si son nulos o indefinidos
    principal: apiItem.principal || 0,
    interest: apiItem.interest || 0,
    total: apiItem.total || 0,
    remainingBalance: apiItem.remainingBalance || 0,
    status: mapPaymentStatus(apiItem.status)
  };
};

// Función para transformar un préstamo de la API a nuestro modelo interno
const transformApiLoanToLoan = (apiLoan: ApiLoan): Loan => {
  // Calculamos la tasa anual en porcentaje (para mostrar)
  let annualizedRate = apiLoan.rateApplied;
  if (apiLoan.ratePeriodicity === 'weekly') {
    annualizedRate = apiLoan.rateApplied * 52; // 52 semanas en un año
  } else if (apiLoan.ratePeriodicity === 'monthly') {
    annualizedRate = apiLoan.rateApplied * 12; // 12 meses en un año
  }
  
  // Convertimos a porcentaje
  const displayRate = annualizedRate * 100;

  // Crear array de pagos si existe
  const payments: Payment[] = apiLoan.payments ? 
    apiLoan.payments.map(p => ({
      id: p.id,
      date: formatDateToSpanish(p.dueDate),
      amount: p.amount,
      status: mapPaymentStatus(p.status)
    })) : [];

  // Ordenar pagos por fecha
  payments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Determinar el próximo pago pendiente
  const nextPayment = payments.find(p => p.status === 'pending');
  
  return {
    id: apiLoan.id,
    amount: apiLoan.principal,
    status: mapLoanStatus(apiLoan.status),
    startDate: formatDateToSpanish(apiLoan.startDate),
    endDate: formatDateToSpanish(apiLoan.expectedEndDate),
    term: apiLoan.term,
    interestRate: displayRate,
    payments: payments,
    commissionAmount: apiLoan.commissionAmount,
    nextPayment: nextPayment ? {
      date: nextPayment.date,
      amount: nextPayment.amount,
      status: 'pending'
    } : undefined
  };
};

// Obtener todos los préstamos del usuario
export const getLoans = async (): Promise<Loan[]> => {
  try {
    // Check cache for fresh data
    const LOANS_CACHE_KEY = 'pf-loans-cache';
    const cachedLoans = sessionStorage.getItem(LOANS_CACHE_KEY);

    if (cachedLoans) {
      try {
        const { loans, timestamp } = JSON.parse(cachedLoans);
        const now = Date.now();
        // If cache is less than 1 minute old, use it
        if (now - timestamp < 60000) {
          return loans;
        }
      } catch (e) {
        console.warn('Error parsing cached loans data:', e);
      }
    }

    const response = await apiClient.get('/api/loans');
    const apiLoans: ApiLoan[] = response.data;
    const loans = apiLoans.map(transformApiLoanToLoan);

    // Cache the results
    try {
      sessionStorage.setItem(LOANS_CACHE_KEY, JSON.stringify({
        loans,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error caching loans data:', e);
    }

    return loans;
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    return [];
  }
};

// Obtener un préstamo específico por ID con detalles completos
export const getLoanById = async (loanId: string): Promise<Loan | null> => {
  try {
    // Cached loan key
    const LOAN_CACHE_KEY = `pf-loan-${loanId}`;
    const cachedLoan = sessionStorage.getItem(LOAN_CACHE_KEY);

    // Check if we have fresh cached data (less than 1 minute old)
    if (cachedLoan) {
      try {
        const { loan, timestamp } = JSON.parse(cachedLoan);
        const now = Date.now();
        // If cache is less than 1 minute old, use it
        if (now - timestamp < 60000) {
          return loan;
        }
      } catch (e) {
        // Continue to fetch if cache parsing fails
        console.warn('Error parsing cached loan data:', e);
      }
    }

    // Get loan basic data and schedule in parallel to reduce API calls
    const [loanResponse, scheduleResponse] = await Promise.all([
      apiClient.get(`/api/loans/${loanId}`),
      apiClient.get(`/api/loans/${loanId}/schedule`).catch(err => {
        console.warn(`Error fetching loan schedule: ${err.message}`);
        return { data: [] };
      })
    ]);

    const apiLoan: ApiLoan = loanResponse.data;
    const loan = transformApiLoanToLoan(apiLoan);
    const scheduleData = scheduleResponse.data;

    // Debug log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Datos de tabla de pagos recibidos:', scheduleData);
    }

    // Detectar qué tipo de datos estamos recibiendo
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      try {
        // Determinamos el tipo de respuesta según las propiedades
        if ('periodIndex' in scheduleData[0]) {
          // Es el nuevo formato (ApiScheduleItemV2)
          loan.scheduleItems = scheduleData.map((item: ApiScheduleItemV2) => transformScheduleItemV2(item));
        } else if ('paymentNumber' in scheduleData[0]) {
          // Es el formato anterior (ApiScheduleItem)
          loan.scheduleItems = scheduleData.map((item: ApiScheduleItem) => transformScheduleItem(item));
        } else {
          // Intentamos adaptar los datos al formato esperado
          if (process.env.NODE_ENV === 'development') {
            console.log('Formato de datos no reconocido, intentando adaptar:', scheduleData[0]);
          }

          loan.scheduleItems = scheduleData.map((item: any, index) => {
            return {
              paymentNumber: item.periodIndex !== undefined ? item.periodIndex + 1 : (item.id || index + 1),
              date: formatDateToSpanish(item.dueDate || new Date().toISOString()),
              principal: item.principalDue || item.principal || 0,
              interest: item.interestDue || item.interest || 0,
              total: item.totalDue || item.total || 0,
              remainingBalance: item.remainingDue || item.remainingBalance || 0,
              status: (item.paid !== undefined) ? (item.paid ? 'paid' : 'pending') : mapPaymentStatus(item.status || 'pending')
            };
          });
        }
      } catch (transformError) {
        console.error('Error al transformar los datos de la tabla de pagos:', transformError);
      }
    }

    // Calcular detalles adicionales
    const totalInterest = loan.scheduleItems ? loan.scheduleItems.reduce((sum, item) => sum + item.interest, 0) : 0;
    const totalAmount = loan.amount + totalInterest + loan.commissionAmount;

    loan.details = {
      totalInterest,
      totalAmount
    };

    // Cache the result with timestamp
    try {
      sessionStorage.setItem(LOAN_CACHE_KEY, JSON.stringify({
        loan,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error caching loan data:', e);
    }

    return loan;
  } catch (error) {
    console.error(`Error al obtener préstamo #${loanId}:`, error);
    return null;
  }
};

// Obtener la tabla de amortización de un préstamo
export const getLoanSchedule = async (loanId: string): Promise<ScheduleItem[]> => {
  try {
    // Check if we have this data in the loan cache
    const LOAN_CACHE_KEY = `pf-loan-${loanId}`;
    const cachedLoan = sessionStorage.getItem(LOAN_CACHE_KEY);

    if (cachedLoan) {
      try {
        const { loan, timestamp } = JSON.parse(cachedLoan);
        const now = Date.now();
        // If cache is less than 1 minute old and contains scheduleItems, use it
        if (now - timestamp < 60000 && loan.scheduleItems && loan.scheduleItems.length > 0) {
          return loan.scheduleItems;
        }
      } catch (e) {
        console.warn('Error parsing cached loan schedule data:', e);
      }
    }

    // Fetch fresh data if cache is missing or expired
    const response = await apiClient.get(`/api/loans/${loanId}/schedule`);
    const data = response.data;
    let scheduleItems: ScheduleItem[] = [];

    // Detectar qué tipo de datos estamos recibiendo
    if (Array.isArray(data) && data.length > 0) {
      // Determinamos el tipo de respuesta según las propiedades
      if ('periodIndex' in data[0]) {
        // Es el nuevo formato (ApiScheduleItemV2)
        scheduleItems = data.map((item: ApiScheduleItemV2) => transformScheduleItemV2(item));
      } else {
        // Es el formato anterior (ApiScheduleItem)
        scheduleItems = data.map((item: ApiScheduleItem) => transformScheduleItem(item));
      }
    }

    return scheduleItems;
  } catch (error) {
    console.error(`Error al obtener tabla de amortización para préstamo #${loanId}:`, error);
    return [];
  }
};

// Obtener los pagos de un préstamo
export const getLoanPayments = async (loanId: string): Promise<Payment[]> => {
  try {
    const response = await apiClient.get(`/api/loans/${loanId}/payments`);
    const apiPayments: ApiPayment[] = response.data;
    
    return apiPayments.map(p => ({
      id: p.id,
      date: formatDateToSpanish(p.dueDate),
      amount: p.amount,
      status: mapPaymentStatus(p.status)
    }));
  } catch (error) {
    console.error(`Error al obtener pagos del préstamo #${loanId}:`, error);
    return [];
  }
};

// Realizar un pago adelantado
export const makeAdvancePayment = async (loanId: string, amount: number): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/loans/${loanId}/payment`, { amount });
    return response.data;
  } catch (error) {
    console.error(`Error al realizar pago adelantado en préstamo #${loanId}:`, error);
    throw error;
  }
}; 