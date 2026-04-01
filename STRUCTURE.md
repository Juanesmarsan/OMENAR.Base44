# OMENAR Base44 - Guía de Estructura de Proyectos

## 📋 Estructura de Carpetas Reorganizada

```
src/
├── App.jsx                          # Componente principal
├── api/                             # Clientes y servicios de API
│   └── base44Client.js              # Cliente Base44
├── components/                      # Componentes React reutilizables
│   ├── ui/                          # Componentes UI (Radix, primitivos)
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── form.jsx
│   │   ├── input.jsx
│   │   ├── table.jsx
│   │   ├── tabs.jsx
│   │   └── ... (más componentes UI)
│   │
│   ├── forms/                       # Formularios específicos
│   │   ├── PaymentForm.jsx
│   │   ├── ProjectEditForm.jsx
│   │   ├── UserForm.jsx
│   │   └── ...
│   │
│   ├── layouts/                     # Componentes de layout
│   │   └── MainLayout.jsx
│   │
│   ├── guards/                      # Guards y protecciones
│   │   └── UserNotRegisteredError.jsx
│   │
│   ├── AttachmentManager.jsx        # Componentes funcionales
│   ├── CalendarLegend.jsx
│   ├── CommentSystem.jsx
│   ├── DailyWorkView.jsx
│   ├── KanbanView.jsx
│   ├── NotificationCenter.jsx
│   └── TimerComponent.jsx
│
├── pages/                           # Páginas principales
│   ├── Dashboard.jsx
│   ├── PageNotFound.jsx
│   ├── Test.jsx
│   │
│   ├── Administration/              # Módulo de Administración
│   │   ├── Administration.jsx
│   │   ├── Management.jsx
│   │   ├── MaintenanceForm.jsx
│   │   ├── tabs/
│   │   │   ├── AccessLogsTab.jsx
│   │   │   ├── AccommodationTab.jsx
│   │   │   ├── EquipmentTab.jsx
│   │   │   ├── GeneralInfoTab.jsx
│   │   │   ├── StrategicGoalsTab.jsx
│   │   │   ├── StrategicObjectivesTab.jsx
│   │   │   └── CertificationDiagnostic.jsx
│   │   └── vehicles/
│   │       ├── VehicleControlTab.jsx
│   │       └── FuelForm.jsx
│   │
│   ├── Employee/                    # Módulo de Empleados
│   │   ├── Employees.jsx
│   │   ├── EmployeeDetail.jsx
│   │   ├── CalendarTab.jsx
│   │   ├── SalariesTab.jsx
│   │   ├── AdvancesTab.jsx
│   │   ├── VariableExpensesTab.jsx
│   │   ├── WorkHoursReport.jsx
│   │   └── ... (pestañas de empleado)
│   │
│   ├── Project/                     # Módulo de Proyectos
│   │   ├── Projects.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── ProjectEditForm.jsx
│   │   ├── ProjectEmployees.jsx
│   │   ├── ProjectExpenses.jsx
│   │   ├── ProjectCertifications.jsx
│   │   ├── NewProject.jsx
│   │   └── ...
│   │
│   └── Finance/                     # Módulo de Finanzas
│       ├── PaymentsDue.jsx
│       ├── PaymentDueCard.jsx
│       ├── Certifications.jsx
│       ├── ProjectFinancialAnalysis.jsx
│       ├── FinancialReportPDF.jsx
│       └── ...
│
├── lib/                             # Librerías y utilidades
│   ├── utils/                       # Funciones de utilidad
│   │   ├── index.js                 # Exportaciones centralizadas
│   │   ├── formatting.js            # Formateo (moneda, tiempo, etc)
│   │   ├── calculations.js          # Cálculos (IVA, salarios, etc)
│   │   ├── CalendarUtils.jsx        # Utilidades de calendario
│   │   ├── helpers.js               # Funciones auxiliares varias
│   │   └── ...
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useAuth.js
│   │   ├── useProject.js
│   │   ├── useEmployee.js
│   │   └── ...
│   │
│   ├── helpers/                     # Funciones helper
│   │   ├── AccessLogger.jsx
│   │   ├── ActivityLogger.jsx
│   │   ├── TemplateManager.jsx
│   │   └── ...
│   │
│   ├── AuthContext.jsx              # Contextos (Auth, etc)
│   └── NavigationTracker.jsx        # Rastreadores
│
├── config/                          # Archivos de configuración
│   ├── components.json
│   ├── jsconfig.json
│   ├── eslint.config.js
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── ...
│
├── entities/                        # Definiciones de entidades (BE)
│   └── ... (archivos de entidades)
│
├── types/                          # TypeScript types (si se usa)
│   └── ... (archivos de tipos)
│
└── styles/                         # Estilos globales
    └── index.css
```

## 🔧 Guía de Uso

### Importar desde utilidades centralizadas

```javascript
// ❌ ANTES (duplicado en múltiples lugares)
const formatCurrency = (value) => `€${(value || 0).toLocaleString('es-ES', ...)}`;

// ✅ DESPUÉS (centralizado)
import { formatCurrency, formatTime, formatHours } from '@/lib/utils';
```

### Estructura de importes

```javascript
// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Componentes funcionales
import DailyWorkView from '@/components/DailyWorkView';
import NotificationCenter from '@/components/NotificationCenter';

// Páginas
import Dashboard from '@/pages/Dashboard';
import ProjectDetail from '@/pages/Project/ProjectDetail';

// Utilidades
import { formatCurrency, calculateStats } from '@/lib/utils';

// Hooks personalizados
import { useAuth } from '@/lib/hooks/useAuth';
import { useProject } from '@/lib/hooks/useProject';
```

## 📦 Cómo agregar nuevos archivos

### Nuevo componente UI
- Ubicación: `src/components/ui/MyComponent.jsx`
- Patrón: Componente puro sin lógica de negocio

### Nuevo formulario
- Ubicación: `src/components/forms/MyForm.jsx`
- Patrón: Componente con validación y manejo de estado

### Nueva página
- Ubicación: `src/pages/Module/PageName.jsx`
- Patrón: Componente que puede contener múltiples sub-componentes

### Nueva utilidad
- Ubicación: `src/lib/utils/categoryName.js`
- Patrón: Funciones puras exportadas
- Debe ser agregado a `src/lib/utils/index.js`

## 🚀 Mejoras Implementadas

### ✅ Deduplicación
- `formatCurrency` - 1 implementación centralizada
- `formatTime`, `formatHours` - centralizadas
- `calculateStats` - función única compartida
- Proyectos financieros - lógica unificada

### ✅ Organización
- Componentes UI separados de lógica de negocio
- Páginas agrupadas por módulo (Admin, Employee, Project, Finance)
- Utilidades centralizadas y reutilizables

### ✅ Mantenibilidad
- Estructura clara y predecible
- Fácil ubicar archivos
- Imports simplificados
- Código DRY (Don't Repeat Yourself)

## 📚 Próximas Mejoras Sugeridas

1. **Custom Hooks**: Extraer lógica de `useEffect` y `useState` a hooks
2. **Servicios**: Consolidar llamadas API en servicios
3. **Type Safety**: Agregar TypeScript (si es posible)
4. **Testing**: Crear carpeta `__tests__` con tests
5. **Documentation**: JSDoc para funciones públicas
6. **Storybook**: Documentación visual de componentes UI

---

**Última actualización**: 2026-04-01  
**Versión**: 1.0 Reorganizado
