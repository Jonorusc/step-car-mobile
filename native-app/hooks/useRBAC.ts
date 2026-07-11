import { useUser } from './useAuth';

export function useRBAC() {
  const user = useUser();
  const isEmployee = user?.type_user?.toLowerCase() === 'employee';
  const isManager = !isEmployee; // Assume anyone not an employee is a manager (or has higher privileges)

  return {
    isEmployee,
    isManager,
    
    // Registro (Veículos Recentes / Criação)
    canCreateRecord: true, // Employees can create records
    canEditRecord: isManager,
    canDeleteRecord: isManager,

    // Categorias
    canCreateCategory: isManager,
    canEditCategory: isManager,
    canDeleteCategory: isManager,

    // Serviços
    canCreateService: isManager,
    canEditService: isManager,
    canDeleteService: isManager,

    // Empresas
    canCreateCompany: isManager,
    canEditCompany: isManager,
    canDeleteCompany: isManager,

    // Financeiro
    canViewFinancial: isManager,
  };
}
