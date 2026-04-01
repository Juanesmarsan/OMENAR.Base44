import { useEffect } from 'react';
import { ActivityLog } from '@/entities/ActivityLog';
import { User } from '@/entities/User';

// Entidades a monitorear
const MONITORED_ENTITIES = [
    'Project', 'Employee', 'Task', 'PaymentDue', 'Vehicle', 'Expense', 
    'ProjectAssignment', 'EmployeeSalary', 'EmployeeAdvance', 'EmployeeVariableExpense',
    'EmployeeEquipment', 'ProjectCertification', 'WorkCalendar', 'FixedExpense'
];

// Traducciones de entidades
const ENTITY_TRANSLATIONS = {
    'Project': 'Proyecto',
    'Employee': 'Empleado',
    'Task': 'Tarea',
    'PaymentDue': 'Vencimiento de Pago',
    'Vehicle': 'Vehículo',
    'Expense': 'Gasto',
    'ProjectAssignment': 'Asignación de Proyecto',
    'EmployeeSalary': 'Nómina',
    'EmployeeAdvance': 'Adelanto',
    'EmployeeVariableExpense': 'Gasto Variable',
    'EmployeeEquipment': 'Equipo/EPI',
    'ProjectCertification': 'Certificación',
    'WorkCalendar': 'Calendario Laboral',
    'FixedExpense': 'Gasto Fijo'
};

const ACTION_TRANSLATIONS = {
    'create': 'creó',
    'update': 'actualizó',
    'delete': 'eliminó'
};

export default function ActivityLogger() {
    useEffect(() => {
        const logActivity = async (entityType, action, entityData, changes = null) => {
            try {
                const currentUser = await User.me();
                
                // Determinar nombre descriptivo del elemento
                let entityName = entityData?.name || 
                                entityData?.title || 
                                entityData?.concept ||
                                entityData?.supplier ||
                                entityData?.license_plate ||
                                (entityData?.first_name && entityData?.last_name ? `${entityData.first_name} ${entityData.last_name}` : null) ||
                                entityData?.code ||
                                `${ENTITY_TRANSLATIONS[entityType]} #${entityData?.id?.substring(0, 8) || 'Nuevo'}`;

                const description = `${ACTION_TRANSLATIONS[action]} ${ENTITY_TRANSLATIONS[entityType]}: ${entityName}`;

                await ActivityLog.create({
                    user_email: currentUser.email,
                    user_name: currentUser.full_name,
                    action_type: action,
                    entity_type: entityType,
                    entity_id: entityData?.id,
                    entity_name: entityName,
                    description: description,
                    changes: changes,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        ip_address: 'Web App',
                        user_agent: navigator.userAgent.substring(0, 100)
                    }
                });
            } catch (error) {
                console.error('Error logging activity:', error);
            }
        };

        // Interceptar métodos de las entidades monitoreadas
        MONITORED_ENTITIES.forEach(entityName => {
            try {
                // Importar dinámicamente la entidad
                import(`@/entities/${entityName}`).then(module => {
                    const Entity = module[entityName];
                    
                    if (Entity) {
                        // Interceptar create
                        const originalCreate = Entity.create;
                        Entity.create = async function(data) {
                            const result = await originalCreate.call(this, data);
                            await logActivity(entityName, 'create', { ...data, id: result.id });
                            return result;
                        };

                        // Interceptar update
                        const originalUpdate = Entity.update;
                        Entity.update = async function(id, data) {
                            const result = await originalUpdate.call(this, id, data);
                            await logActivity(entityName, 'update', { ...data, id }, data);
                            return result;
                        };

                        // Interceptar delete
                        const originalDelete = Entity.delete;
                        Entity.delete = async function(id) {
                            const result = await originalDelete.call(this, id);
                            await logActivity(entityName, 'delete', { id });
                            return result;
                        };
                    }
                }).catch(err => {
                    // Entity might not exist, ignore
                });
            } catch (error) {
                console.error(`Error setting up monitoring for ${entityName}:`, error);
            }
        });
    }, []);

    return null; // Componente invisible
}