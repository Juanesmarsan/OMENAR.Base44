**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

---

## 📚 Documentación del Proyecto

Este proyecto ha sido completamente reorganizado y optimizado. Consulta:
- **[STRUCTURE.md](STRUCTURE.md)** - Estructura del proyecto
- **[AUDIT_REPORT.md](AUDIT_REPORT.md)** - Reporte de auditoría
- **[SUMMARY.md](SUMMARY.md)** - Resumen ejecutivo

## 🎯 Guía Rápida de Desarrollo

### Custom Hooks (Reduce duplicación)
```javascript
import { useAuth, useData, useForm, useAPI } from '@/lib/hooks';

// Autenticación
const { user, logout, isAuthenticated } = useAuth();

// Cargar datos con filtro
const { filtered, setFilters, refetch } = useData(
  fetchEmployees,
  { search: (emp, term) => emp.name.includes(term) }
);

// Formularios
const { values, errors, handleChange, handleSubmit } = useForm(
  { name: '', email: '' },
  onSubmit,
  { email: Validators.email }
);

// Llamadas API
const { data, isLoading } = useAPI('/api/employees');
```

### API Services (Centraliza lógicas de backend)
```javascript
import { EmployeeService, ProjectService, FinancialService } from '@/api/services';

// Obtener empleados
const employees = await EmployeeService.getAll();
const emp = await EmployeeService.getById(id);
const salaries = await EmployeeService.getSalaries(empId);

// Proyectos
const projects = await ProjectService.getAll();
const certs = await ProjectService.getCertifications(projId);

// Finanzas
const expenses = await FinancialService.getFixedExpenses();
const paymentsDue = await FinancialService.getPaymentsDue();
```

### Validadores (Consistencia en validación)
```javascript
import { Validators, FormValidators } from '@/lib/utils';

// Validar campos individuales
try {
  Validators.email(value);
  Validators.positiveNumber(amount);
  Validators.required(name, 'Nombre');
} catch (error) {
  console.log(error.message);
}

// Usar en formularios
const validators = FormValidators.employeeForm;
const { errors } = useForm(initialValues, onSubmit, validators);
```

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
